





# Extract Energy from OSZICAR



## Regex Expression

In the OSZICAR file, we want to match lines that look like the following examples:


```bash
(nvim) [clopton@bridges2-login012 1000]$ grep "T= " OSZI_1000K_blk7.OSZICAR 
    1 T=  1058. E= -.14210940E+04 F= -.15428894E+04 E0= -.15428894E+04  EK= 0.26118E+02 SP= 0.96E+02 SK= 0.13E-01 mag=     -0.006
    2 T=  1062. E= -.14211890E+04 F= -.15430470E+04 E0= -.15430470E+04  EK= 0.26231E+02 SP= 0.96E+02 SK= 0.96E-02 mag=     -0.000
    3 T=  1072. E= -.14212160E+04 F= -.15432773E+04 E0= -.15432773E+04  EK= 0.26477E+02 SP= 0.96E+02 SK= 0.69E-02 mag=      0.000
    4 T=  1077. E= -.14213449E+04 F= -.15434772E+04 E0= -.15434772E+04  EK= 0.26583E+02 SP= 0.96E+02 SK= 0.41E-02 mag=     -0.000
    5 T=  1069. E= -.14212343E+04 F= -.15431435E+04 E0= -.15431435E+04  EK= 0.26387E+02 SP= 0.96E+02 SK= 0.22E-02 mag=      0.000
    6 T=  1063. E= -.14211767E+04 F= -.15429280E+04 E0= -.15429280E+04  EK= 0.26247E+02 SP= 0.96E+02 SK= 0.10E-02 mag=      0.000
    7 T=  1057. E= -.14211115E+04 F= -.15426961E+04 E0= -.15426961E+04  EK= 0.26092E+02 SP= 0.95E+02 SK= 0.29E-03 mag=     -0.000
    8 T=  1040. E= -.14211328E+04 F= -.15422945E+04 E0= -.15422945E+04  EK= 0.25674E+02 SP= 0.95E+02 SK= 0.21E-04 mag=     -0.000
    9 T=  1023. E= -.14210848E+04 F= -.15418284E+04 E0= -.15418284E+04  EK= 0.25257E+02 SP= 0.95E+02 SK= 0.84E-05 mag=      0.000
```


The regex pattern matches any line that starts with the following pattern `<step><whitespace>T=<temperature>.<whitespace>E=<energy> `. Once a line matches, it extracts fields via 2 capture groups: `(\d+)` _group(1)_ -> the step number (first integer at the start of the line), and `([-\d.E+-]+)` _group(2)_ -> the energy right after `E=`.

```Python
match = re.search(r'^\s*(\d+)\s+T=\s*[\d.]+\.\s+E=\s*([-\d.E+]+)', line)
```




__*RegEx Patterns:*__
1.) `s*(\d+)`: match zero or more whitespace characters, then capture a group one or more digits
2.) `\s+T=\s*` match one or more whitespace characters, then the literal string `T=`, then zero or more whitespace characters 
3.) `[\d.]+\.` match one or more characters that are either digits or literal dots, followed by a literal dot (e.g. x. or x.x.x., or for example x....x..x. ), where each x can be any length of digits.
4.) `\s+E=\s*` match one or more whitespace characters, the the literal string `E=`, then zero or more whitespace characters.
5.) `([\d.E+-]+)` Capture a group consisting of a sequence of **one or more** characters, where **every character** is either a digit, `.`, `E`, `+`, or `-` (in any order and with any repetition). (for example `E= -.14210940E+04` and `E--++..`)


If the regex actually matched the line, `match` will be a `re.Match` object. If not, it will be `None`. If you print the match object, it should look something like:


```python
<re.Match object; span=(0, 34), match='    1 T=  1058. E= -.14210940E+04'>
```

or more generally:

```Python
<re.Match object; span=(x, y), match='    1 T=  1058. E= -.14210940E+04'>
```

Where beginning index `x` and ending index  `y` is where the matched string starts and ends. 



## Energy Extraction Function




```Python
def extract_energy_from_oszicar(filepath):
    """
    Extract energy values from OSZICAR file.
    Returns list of (step, energy) tuples.
    """
    energies = []
    with open(filepath, 'r') as f:
        for line in f:
            # Look for lines with energy data: "step T= temp E= energy F= ..."
            match = re.search(r'^\s*(\d+)\s+T=\s*[\d.]+\.\s+E=\s*([-\d.E+-]+)', line)
            if match:
                step = int(match.group(1))
                energy = float(match.group(2))
                energies.append((step, energy))
    return energies
```


```Python
import re

def capture_data_from_line(filepath):
    
    data = []
    with open(filepath, 'r') as f:
        for line in f:
            # Look for lines with energy data: "step T= temp E= energy F= ..."
            match = re.search(r'---pattern with captured groups---', line)
            if match:
                extracted_group_1 = <int, float>(match.group(1))
                extracted_group_2 = <int, float>(match.group(2))
                ...
                data.append((extracted_group_1, extracted_group_2))
    return data
```



# Get  OSZICAR files




```Python
def get_all_oszicar_files(temp_dir):
    """
    Get all OSZICAR files for a given temperature directory.
    Returns sorted list of filepaths.
    """
    pattern = os.path.join(temp_dir, "OSZI_*K_blk*.OSZICAR")
    files = glob.glob(pattern)

    # Sort by block number
    files.sort(key=lambda x: int(re.search(r'blk(\d+)', x).group(1)))
    return files
```



```bash
(nvim) [clopton@bridges2-login012 11_ARCH]$ pwd
/ocean/projects/mat220011p/clopton/AIMD/CeO2/VASP6_AUTO/01-mp-1018664-CeO2/11_ARCH

(nvim) [clopton@bridges2-login012 11_ARCH]$ ls 250/*OSZI*
250/OSZI_250K_blk0.OSZICAR  250/OSZI_250K_blk2.OSZICAR  250/OSZI_250K_blk4.OSZICAR  250/OSZI_250K_blk6.OSZICAR  250/OSZI_250K_blk8.OSZICAR
250/OSZI_250K_blk1.OSZICAR  250/OSZI_250K_blk3.OSZICAR  250/OSZI_250K_blk5.OSZICAR  250/OSZI_250K_blk7.OSZICAR  250/OSZI_250K_blk9.OSZICAR

(nvim) [clopton@bridges2-login012 11_ARCH]$ ls 500/*OSZI*
500/OSZI_500K_blk0.OSZICAR  500/OSZI_500K_blk2.OSZICAR  500/OSZI_500K_blk4.OSZICAR  500/OSZI_500K_blk6.OSZICAR  500/OSZI_500K_blk8.OSZICAR
500/OSZI_500K_blk1.OSZICAR  500/OSZI_500K_blk3.OSZICAR  500/OSZI_500K_blk5.OSZICAR  500/OSZI_500K_blk7.OSZICAR  500/OSZI_500K_blk9.OSZICAR

(nvim) [clopton@bridges2-login012 11_ARCH]$ ls 750/*OSZI*
750/OSZI_750K_blk0.OSZICAR  750/OSZI_750K_blk2.OSZICAR  750/OSZI_750K_blk4.OSZICAR  750/OSZI_750K_blk6.OSZICAR  750/OSZI_750K_blk8.OSZICAR
750/OSZI_750K_blk1.OSZICAR  750/OSZI_750K_blk3.OSZICAR  750/OSZI_750K_blk5.OSZICAR  750/OSZI_750K_blk7.OSZICAR  750/OSZI_750K_blk9.OSZICAR

(nvim) [clopton@bridges2-login012 11_ARCH]$ ls 1000/*OSZI*
1000/OSZI_1000K_blk0.OSZICAR  1000/OSZI_1000K_blk2.OSZICAR  1000/OSZI_1000K_blk4.OSZICAR  1000/OSZI_1000K_blk6.OSZICAR  1000/OSZI_1000K_blk8.OSZICAR
1000/OSZI_1000K_blk1.OSZICAR  1000/OSZI_1000K_blk3.OSZICAR  1000/OSZI_1000K_blk5.OSZICAR  1000/OSZI_1000K_blk7.OSZICAR  1000/OSZI_1000K_blk9.OSZICAR
```



# Combine Energy Data



```Python
def combine_energy_data(temp_dir, total_steps=10000):
    """
    Combine energy data from all OSZICAR files in a temperature directory.
    Returns numpy arrays of steps and energies with continuous step indexing across blocks.
    """
    all_energies = []

    # Get all OSZICAR files
    oszicar_files = get_all_oszicar_files(temp_dir)
    if not oszicar_files:
        print(f"Warning: No OSZICAR files found in {temp_dir}")
        return np.array([]), np.array([])

    # Extract energy from each file with step offset based on block index
    for filepath in oszicar_files:
        block_match = re.search(r'blk(\d+)', filepath)
        block_index = int(block_match.group(1)) if block_match else 0
        step_offset = block_index * 1000

        energies = extract_energy_from_oszicar(filepath)
        for step, energy in energies:
            all_energies.append((step + step_offset, energy))

    # Sort by global step number
    all_energies.sort(key=lambda x: x[0])

    # Convert to numpy arrays
    steps = np.array([e[0] for e in all_energies])
    energies = np.array([e[1] for e in all_energies])
    return steps, energies
```