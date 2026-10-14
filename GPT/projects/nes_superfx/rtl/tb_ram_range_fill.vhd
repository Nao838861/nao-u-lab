library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;
use std.env.all;

entity tb_ram_range_fill is end entity;
architecture test of tb_ram_range_fill is
  signal clk : std_logic := '0';
  signal reset,start,clear_flags : std_logic := '0';
  signal address,length,pattern,ram_address : std_logic_vector(15 downto 0) := (others=>'0');
  signal protect_front,ram_grant : std_logic := '1';
  signal front_bank : std_logic := '0';
  signal busy,done,error,ram_request : std_logic;
  signal ram_data : std_logic_vector(7 downto 0);
  type memory_t is array(0 to 40959) of std_logic_vector(7 downto 0);
  signal memory : memory_t := (others=>x"A5");
begin
  clk<=not clk after 20 ns;
  dut: entity work.ram_range_fill port map(clk,reset,start,clear_flags,address,length,pattern,
    protect_front,front_bank,ram_grant,busy,done,error,ram_request,ram_address,ram_data);
  process(clk)
  begin
    if rising_edge(clk) and reset='0' and ram_request='1' and ram_grant='1' then
      assert to_integer(unsigned(ram_address))<40960 report "out of bounds write" severity failure;
      memory(to_integer(unsigned(ram_address)))<=ram_data;
    end if;
  end process;
  process
    procedure tick is begin wait until rising_edge(clk);wait for 1 ns;end;
    procedure command(a,n,p:natural) is
    begin
      address<=std_logic_vector(to_unsigned(a,16));length<=std_logic_vector(to_unsigned(n,16));
      pattern<=std_logic_vector(to_unsigned(p,16));start<='1';tick;start<='0';
    end;
  begin
    reset<='1';tick;reset<='0';tick;
    command(16384,16384,0);
    assert busy='1' and memory(16384)=x"A5" report "asynchronous start" severity failure;
    ram_grant<='0';for i in 1 to 17 loop tick;end loop;
    assert busy='1' and ram_address=x"4000" and memory(16384)=x"A5" report "grant stall" severity failure;
    ram_grant<='1';
    for i in 1 to 16383 loop tick;assert busy='1' report "early completion" severity failure;end loop;
    assert memory(32767)=x"A5" report "last byte not yet committed" severity failure;
    tick;
    assert busy='0' and done='1' and error='0' report "exact 16384-cycle fill" severity failure;
    for i in 0 to 40959 loop
      if i>=16384 and i<32768 then assert memory(i)=x"00" severity failure;
      else assert memory(i)=x"A5" report "outside fill changed" severity failure;end if;
    end loop;
    command(16387,5,65280);for i in 1 to 5 loop tick;end loop;
    for i in 0 to 4 loop
      if i mod 2=0 then assert memory(16387+i)=x"00" severity failure;
      else assert memory(16387+i)=x"FF" severity failure;end if;
    end loop;
    command(32768,0,0);assert busy='0' and done='1' severity failure;
    command(32768,3,4660);for i in 1 to 3 loop tick;end loop;
    assert memory(32768)=x"34" and memory(32769)=x"12" and memory(32770)=x"34" severity failure;
    command(16383,2,0);assert busy='0' and error='1' and memory(16383)=x"A5" report "front protection" severity failure;
    command(40959,2,0);assert busy='0' and error='1' and memory(40959)=x"A5" report "end bounds" severity failure;
    command(65535,2,0);assert busy='0' and error='1' report "address overflow" severity failure;
    front_bank<='1';command(32767,2,0);assert busy='0' and error='1' report "front bank 1" severity failure;
    front_bank<='0';command(16384,10,22136);
    command(32768,30,0);assert busy='1' and error='1' report "busy command rejected" severity failure;
    for i in 1 to 9 loop tick;end loop;
    assert busy='0' and done='1' and memory(16384)=x"78" and memory(16385)=x"56" severity failure;
    command(16416,10,65535);for i in 1 to 4 loop tick;end loop;
    reset<='1';tick;reset<='0';tick;
    assert busy='0' and done='0' and error='0' and memory(16416)=x"FF" and memory(16420)=x"00"
      report "reset cancels and preserves completed writes" severity failure;
    report "RAM RANGE FILL RTL PASS: throughput, pattern, bounds, front, stall, busy, reset" severity note;
    stop;wait;
  end process;
end architecture;
