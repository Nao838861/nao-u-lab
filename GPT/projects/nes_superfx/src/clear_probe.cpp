#include "BitmapBoard.hpp"
#include <algorithm>
#include <fstream>
#include <iostream>
#include <stdexcept>
#include <vector>

// Observe the unchanged renderer's actual writes, including deferred RAM writes.
class ClearBoard : public nesfx::BitmapBoard {
public:
    unsigned writes = 0, bank = 1;
    uint64_t first = 0, last = 0, counter = 0;
    bool watching = false;
    void GsuWrite(uint32_t address, uint8_t value) override {
        auto offset = address & 65535;
        if(watching && writes < 16384) {
            if(offset != bank * 16384 + writes || value != 0)
                throw std::runtime_error("clear write sequence/value mismatch");
            if(!writes) first = gsu.GetState().CycleCount;
            last = gsu.GetState().CycleCount;
            ++writes;
        } else if(watching && !counter && offset == 0x8010) {
            counter = gsu.GetState().CycleCount;
            watching = false;
        }
        BitmapBoard::GsuWrite(address, value);
    }
};

int main(int argc, char** argv) {
    try {
        if(argc != 2) throw std::runtime_error("usage: nesfx_clear_probe payload.bin");
        std::ifstream input(argv[1], std::ios::binary);
        std::vector<uint8_t> payload{std::istreambuf_iterator<char>(input), {}};
        if(payload.size() != 8192) throw std::runtime_error("payload size");
        std::cout << "{\"reference_hz\":25000000,\"clear_bytes\":16384,\"frames\":[";
        bool comma = false;
        for(unsigned fast = 0; fast < 2; ++fast) {
            ClearBoard board;
            board.CpuClock(); board.CpuClock();
            std::copy(payload.begin(), payload.end(), board.memory.begin() + 32768);
            board.CpuWrite(0x5034, 0x70);
            board.CpuWrite(0x5037, fast ? 0xa0 : 0x80);
            board.CpuWrite(0x5039, fast);
            board.CpuWrite(0x503a, 0x18); board.mode = 3;
            for(unsigned phase = 0; phase < 2; ++phase) {
                board.bank = board.front ^ 1;
                std::fill_n(board.memory.begin() + board.bank * 16384, 16384, 0xa5);
                board.memory[0x8004] = phase;
                board.memory[0x8006] = 0;
                board.memory[0x8007] = board.bank ? 0x40 : 0;
                board.CpuWrite(0x5038, board.bank ? 0x10 : 0);
                board.writes = 0; board.first = board.last = board.counter = 0;
                board.watching = true;
                board.CpuWrite(0x501e, 0); board.CpuWrite(0x501f, 0x94);
                auto start = board.gsu.GetState().CycleCount;
                while(board.Busy() && board.gsu.GetState().CycleCount - start < 25000000)
                    board.gsu.RunUntil(board.gsu.GetState().CycleCount + 1);
                if(board.Busy() || board.faults || board.writes != 16384 || !board.counter)
                    throw std::runtime_error("render/clear failure");
                auto elapsed = board.gsu.GetState().CycleCount - start;
                if(comma) std::cout << ',';
                comma = true;
                std::cout << "{\"clock_select\":" << fast << ",\"multiplier_fast\":" << fast
                          << ",\"phase\":" << phase << ",\"bank\":" << board.bank
                          << ",\"writes\":" << board.writes
                          << ",\"start_to_first_write\":" << board.first - start
                          << ",\"start_to_last_write\":" << board.last - start
                          << ",\"start_to_first_counter_write\":" << board.counter - start
                          << ",\"render_clocks\":" << elapsed << '}';
                board.targetClock = board.gsu.GetState().CycleCount;
                board.CpuWrite(0x5fe2, board.bank);
            }
        }
        std::cout << "]}\n";
        return 0;
    } catch(const std::exception& error) {
        std::cerr << error.what() << '\n';
        return 1;
    }
}
