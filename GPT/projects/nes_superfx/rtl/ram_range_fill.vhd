library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

-- 25 MHz byte-wide RAM master. A granted edge commits exactly one byte.
-- The parent arbitrates the RAM port, blocks GSU GO/present, and decodes MMIO.
entity ram_range_fill is
  port (
    clk, reset, start, clear_flags : in std_logic;
    address, length, pattern : in std_logic_vector(15 downto 0);
    protect_front, front_bank, ram_grant : in std_logic;
    busy, done, error, ram_request : out std_logic;
    ram_address : out std_logic_vector(15 downto 0);
    ram_data : out std_logic_vector(7 downto 0)
  );
end entity;

architecture rtl of ram_range_fill is
  signal active, finished, failed, phase : std_logic := '0';
  signal cursor, remaining, fill_pattern : unsigned(15 downto 0) := (others=>'0');
begin
  busy<=active;done<=finished;error<=failed;ram_request<=active;
  ram_address<=std_logic_vector(cursor);
  ram_data<=std_logic_vector(fill_pattern(7 downto 0)) when phase='0' else
            std_logic_vector(fill_pattern(15 downto 8));
  process(clk)
    variable first, count, last_exclusive, protected_first : natural;
  begin
    if rising_edge(clk) then
      if reset='1' then
        active<='0';finished<='0';failed<='0';phase<='0';
        cursor<=(others=>'0');remaining<=(others=>'0');fill_pattern<=(others=>'0');
      else
        if clear_flags='1' then finished<='0';failed<='0';end if;
        if active='1' and ram_grant='1' then
          cursor<=cursor+1;remaining<=remaining-1;phase<=not phase;
          if remaining=1 then active<='0';finished<='1';end if;
        end if;
        if start='1' then
          first:=to_integer(unsigned(address));count:=to_integer(unsigned(length));
          last_exclusive:=first+count;
          protected_first:=0;
          if front_bank='1' then protected_first:=16384;end if;
          if active='1' or first>40960 or last_exclusive>40960 or
             (protect_front='1' and count/=0 and first<protected_first+16384 and last_exclusive>protected_first) then
            failed<='1';
          else
            cursor<=unsigned(address);remaining<=unsigned(length);fill_pattern<=unsigned(pattern);
            phase<='0';failed<='0';finished<='0';active<='1';
            if count=0 then active<='0';finished<='1';end if;
          end if;
        end if;
      end if;
    end if;
  end process;
end architecture;
