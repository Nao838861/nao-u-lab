"""固定したMesen GSUを、SNESホストから分離して生成する。原本は変更しない。"""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCK = json.loads((ROOT / 'sources.lock.json').read_text())
SOURCE = ROOT / '.cache/Mesen2'
OUT = ROOT / 'build/generated'


def run(*args):
    subprocess.run(args, check=True)


def replace(text, old, new):
    if old not in text:
        raise RuntimeError(f'固定ソースに置換対象がない: {old[:100]}')
    return text.replace(old, new)


def functions(text):
    # 対象は固定commitのGSU定義。関数単位で選び、命令内部には手を入れない。
    matches = list(re.finditer(r'^(?:[\w:*&<>]+\s+)?Gsu::([\w~]+)\([^\n]*\)\n\{', text, re.M))
    return {m[1]: text[m.start():matches[i+1].start() if i+1 < len(matches) else len(text)].strip()
            for i, m in enumerate(matches)}


def main():
    global SOURCE
    parser = argparse.ArgumentParser()
    parser.add_argument('--fetch', action='store_true')
    parser.add_argument('--source',type=Path)
    args = parser.parse_args()
    if args.source:SOURCE=args.source.resolve()
    if not SOURCE.exists():
        if not args.fetch:
            parser.error('初回は --fetch を指定')
        run('git', 'clone', '--no-checkout', '--filter=blob:none', LOCK['repository'], str(SOURCE))
        run('git', '-C', str(SOURCE), 'checkout', '--detach', LOCK['revision'])
    revision = subprocess.check_output(['git', '-C', str(SOURCE), 'rev-parse', 'HEAD'], text=True).strip()
    if revision != LOCK['revision']:
        raise RuntimeError(f'GSUソースの版が違う: {revision}')
    dirty = subprocess.check_output(['git', '-C', str(SOURCE), 'status', '--porcelain'], text=True)
    if dirty:
        raise RuntimeError('GSU原本に変更がある。別キャッシュを使うこと')
    base = SOURCE / 'Core/SNES/Coprocessors/GSU'
    original = {p.name: p.read_bytes() for p in base.glob('Gsu*') if p.is_file()}
    read = lambda name: original[name].decode('utf-8-sig').replace('\r\n', '\n')
    types = re.sub(r'^#include.*\n', '', read('GsuTypes.h'), flags=re.M).replace(' : BaseState', '')
    header = read('Gsu.h')
    private = header[header.index('\tGsuState _state;'):header.index('\npublic:')]
    private = re.sub(r'\n\tuint32_t _gsuRamSize.*?\n\tvoid Exec', '\n\tvoid Exec', private, flags=re.S)
    methods = functions(read('Gsu.cpp'))
    removed = {'Gsu', '~Gsu', 'ProcessEndOfFrame', 'Run', 'ReadGsu', 'WriteGsu', 'Peek', 'PeekBlock',
               'GetAbsoluteAddress', 'Serialize', 'LoadBattery', 'SaveBattery', 'GetMemoryMappings',
               'DebugSetProgramCounter'}
    body = '\n\n'.join(v for k, v in methods.items() if k not in removed)
    body = re.sub(r'^\s*_emu->Process(?:Instruction|MemoryRead)<CpuType::Gsu>\([^\n]*\);\n', '', body, flags=re.M)
    body = replace(body, '_console->InitializeRam(_cache, 512);', 'memset(_cache, 0, sizeof(_cache));\n\t_r15Changed = false;')
    body = replace(body, '_cpu->ClearIrqSource(SnesIrqSource::Coprocessor);', '// IRQ level is SFR.Irq; host observes it.')
    body = re.sub(r'^\s*LogDebug\([^\n]*\);\n', '', body, flags=re.M)
    instructions = re.sub(r'^#include.*\n', '', read('Gsu.Instructions.cpp'), flags=re.M)
    instructions = replace(instructions, '_cpu->SetIrqSource(SnesIrqSource::Coprocessor);', '// Host observes SFR.Irq.')
    # MiSTer GSU sets FLAG_IRQ on STOP even with IRQ_OFF=1 (GSU.vhd:335-337).
    # CFGR masks the output, not the internal flag; N8 Pro never wires IRQ to CPU.
    instructions = replace(instructions, 'if(!_state.IrqDisabled) {\n\t\t_state.SFR.Irq = true;\n\t\t// Host observes SFR.Irq.\n\t}', '_state.SFR.Irq = true;')
    instructions = replace(instructions, 'Step(_state.HighSpeedMode ? 1 : 2);', 'if(!_bus.FastInternalRam()) Step(_state.HighSpeedMode ? 1 : 2);')
    instructions = replace(instructions, 'Step((_state.HighSpeedMode ? 3 : 7) * (_state.ClockSelect ? 1 : 2));', 'if(!_bus.FastInternalRam()) Step((_state.HighSpeedMode ? 3 : 7) * (_state.ClockSelect ? 1 : 2));')
    serialization = methods['Serialize']
    serialization = serialization[serialization.index('{')+1:serialization.rindex('}')]
    serialization = replace(serialization, 'SVArray(_gsuRam, _gsuRamSize);', 'SV(_r15Changed); SV(_lastOpAddr);')
    serialization = re.sub(r'SVArray\(([^,]+), ([^)]+)\)', r's.StreamArray(\1, \2, "\1")', serialization)
    serialization = re.sub(r'SV\(([^)]+)\)', r's.Stream(\1, "\1")', serialization)
    public = '''
public:
    explicit Gsu(Bus& bus) : _bus(bus) { Reset(); }
    void Reset();
    uint8_t Read(uint32_t addr);
    uint8_t Peek(uint32_t addr) { Gsu copy = *this; return copy.Read(addr); }
    void Write(uint32_t addr, uint8_t value);
    GsuState& GetState();
    uint32_t DebugGetProgramCounter();
    uint8_t MemoryAccessClocks() const {
        if(_bus.FastInternalRam()) return 3; // Conservative instruction model, including RTL RAM-state overhead.
        return static_cast<uint8_t>((_state.ClockSelect ? 5 : 6) * _bus.MemoryClockScale());
    }
    void RunUntil(uint64_t target) {
        while(!_stopped && _state.CycleCount < target) Exec();
        // Upstream Step narrows its delay decrement to uint8_t. Bound idle chunks.
        while(_state.CycleCount < target) Step(std::min<uint64_t>(target - _state.CycleCount, 255));
    }
    uint8_t ReadGsu(uint32_t addr, MemoryOperationType) { return _bus.GsuRead(addr); }
    void WriteGsu(uint32_t addr, uint8_t value, MemoryOperationType) { _bus.GsuWrite(addr, value); }
    template<class S> void Serialize(S& s) {
''' + serialization + '\n    }\n};\n'
    generated = '''// Generated from pinned Mesen2; GPL-3.0-or-later. See sources.lock.json.
#pragma once
#include <cstdint>
#include <cstring>
#include <algorithm>
namespace nesfx {
struct Bus {
    virtual ~Bus() = default;
    virtual uint8_t GsuRead(uint32_t) = 0;
    virtual void GsuWrite(uint32_t, uint8_t) = 0;
    virtual uint8_t MemoryClockScale() const { return 1; }
    virtual bool FastInternalRam() const { return false; }
};
enum class MemoryOperationType { Read, Write, ExecOpCode, ExecOperand };
''' + types + '\nclass Gsu {\nprivate:\n    Bus& _bus;\n' + private + public
    # Optional faster execution clock with external-memory time kept fixed.
    # Scale=1 is exactly the pinned core's original timing, including ABI1.
    # Internal cache RAM streams one byte per FPGA clock. Keep a conservative
    # 16 transfer clocks plus 10 arbitration/entry/exit clocks in the instruction
    # model. Validate conservatism against the RTL, not the desired frame rate.
    body = replace(body, '_state.ClockSelect ? 5*16 : 6*16', '(_bus.FastInternalRam() ? 26 : 16 * MemoryAccessClocks())')
    body = replace(body, '_state.ClockSelect ? 5 : 6', 'MemoryAccessClocks()')
    instructions = replace(instructions, '_state.ClockSelect ? 5 : 6', 'MemoryAccessClocks()')
    body = re.sub(r'^(?=(?:[\w:*&<>]+\s+)?Gsu::)', 'inline ', body, flags=re.M)
    instructions = re.sub(r'^(?=(?:[\w:*&<>]+\s+)?Gsu::)', 'inline ', instructions, flags=re.M)
    generated += body + '\n' + instructions + '\n}\n'
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'NesFxGsu.hpp').write_text(generated, encoding='utf-8')
    manifest = {'revision': revision, 'files': {name: hashlib.sha256(data).hexdigest() for name, data in original.items()},
                'generated_sha256': hashlib.sha256(generated.encode()).hexdigest()}
    (OUT / 'source_manifest.json').write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf-8')
    print(f'GSU generated: {OUT}')


if __name__ == '__main__':
    main()
