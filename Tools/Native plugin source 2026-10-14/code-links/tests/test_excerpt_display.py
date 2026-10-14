import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(shutil.which('nvim'), 'Neovim required for display regression')
class ExcerptDisplay(unittest.TestCase):
    def test_rendered_original_line_numbers_and_source_return(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder).resolve()
            source = root / 'source.txt'
            original = ''.join(f'line {n}\n' for n in range(1, 101))
            source.write_text(original)
            script = root / 'check.lua'
            script.write_text('''
vim.opt.rtp:prepend(%s)
local links = require('code_links')
local source = %s
-- Real asynchronous readers keep job objects as table keys.
links.jobs[{}]=true
vim.wo.statuscolumn='%%l '
local global_column=vim.go.statuscolumn
links.call=function(_, cb)
  cb({path=source, start=28, ['end']=99,
      lines={'line 28','line 29','...','line 99'},
      line_numbers={28,29,vim.NIL,99}})
end
links.open(%s, '{{source.txt#L28-L29,L99}}')
assert(vim.b.code_links_excerpt, 'Excerpt did not open')
assert(vim.go.statuscolumn==global_column, 'Excerpt changed global column default')
-- Opening another excerpt must not inherit the first excerpt's custom column
-- as the source-window default.
links.open(vim.fs.dirname(source), '{{source.txt#L28-L29,L99}}')
local win=vim.api.nvim_get_current_win()
for row, expected in ipairs({'28','29','·','99'}) do
  local text=vim.api.nvim_eval_statusline(vim.wo.statuscolumn,
    {winid=win, use_statuscol_lnum=row}).str
  assert(vim.trim(text)==expected, 'Wrong source number: '..text)
end
assert(vim.v.errmsg=='', vim.v.errmsg)
assert(vim.bo.readonly and not vim.bo.modifiable)
vim.api.nvim_win_set_cursor(0,{4,0})
links.open_source()
assert(vim.api.nvim_buf_get_name(0)==source)
assert(vim.api.nvim_win_get_cursor(0)[1]==99)
assert(vim.wo.statuscolumn=='%%l ', 'Excerpt column leaked into source window')
assert(not vim.bo.modified)
vim.cmd('qa!')
''' % (json.dumps(str(ROOT / 'nvim')), json.dumps(str(source)), json.dumps(str(root))))
            result = subprocess.run(
                ['nvim', '--headless', '-u', 'NONE', '-i', 'NONE', '-l', str(script)],
                capture_output=True, text=True, timeout=15,
            )
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertEqual(source.read_text(), original)


if __name__ == '__main__':
    unittest.main()
