import json
import os
import shlex
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'core'))
import code_links as core


class StartupNavigation(unittest.TestCase):
    def test_cold_launch_supplies_literal_filename(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder).resolve()
            source = root / "a 'quoted' $file.py"
            source.write_text('one\ntwo\nthree\n')
            with patch.object(core, 'CACHE', root / 'cache'), patch.dict(
                os.environ, {'NAV_REGISTRY': str(root / 'aliases.psv')}
            ), patch.object(core.subprocess, 'run'):
                core.launch(root, '{{' + source.name + '#L2}}', action='source')
            script = next((root / 'cache').glob('launch-*.command')).read_text()
            argv = shlex.split(script.splitlines()[1])
            self.assertEqual(argv[-2:], ['--', str(source)])
            request = json.loads(next((root / 'cache').glob('open-*.json')).read_text())
            self.assertEqual(request['source_line'], 2)

    @unittest.skipUnless(shutil.which('nvim'), 'Neovim required for startup regression')
    def test_linked_line_survives_late_last_position_restore(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder).resolve()
            source = root / 'source.txt'
            source.write_text('one\ntwo\nthree\n')
            script = root / 'check.lua'
            script.write_text('''
vim.opt.rtp:prepend(%s)
local source = %s
vim.cmd('edit '..vim.fn.fnameescape(source))
vim.api.nvim_buf_set_mark(0, '"', 3, 0, {})
local links = require('code_links')
links.call = function(_, cb) cb({path=source, full=true}) end
links.open(%s, '{{source.txt#L2}}', 2, 'current', 'source')
assert(vim.api.nvim_win_get_cursor(0)[1] == 2)
-- LazyVim can replay BufReadPost after its delayed startup initialization.
vim.api.nvim_create_autocmd('BufReadPost', {callback=function(e)
  if vim.b[e.buf].lazyvim_last_loc then return end
  vim.b[e.buf].lazyvim_last_loc=true
  vim.api.nvim_win_set_cursor(0, vim.api.nvim_buf_get_mark(e.buf, '"'))
end})
vim.api.nvim_exec_autocmds('BufReadPost', {buffer=0})
assert(vim.api.nvim_win_get_cursor(0)[1] == 2, 'Remembered position displaced linked line')
assert(vim.api.nvim_buf_get_name(0) == source)
assert(not vim.bo.modified)
vim.cmd('qa!')
''' % (json.dumps(str(ROOT / 'nvim')), json.dumps(str(source)), json.dumps(str(root))))
            result = subprocess.run(
                ['nvim', '--headless', '-u', 'NONE', '-i', 'NONE', '-l', str(script)],
                capture_output=True, text=True, timeout=15,
            )
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == '__main__':
    unittest.main()
