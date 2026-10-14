vim.opt.rtp:prepend('/Users/gradyclopton/Projects/code-links/nvim')
local m=require('code_links')
local root='/Users/gradyclopton/ObsidianVaults/code_links_lab'
m.open(root,'{{dir:scripts|Scripts}}')
assert(vim.wait(5000,function()return vim.api.nvim_buf_get_name(0)==root..'/scripts' end,20))
print('PASS directory link opens the directory buffer')
vim.cmd('qa!')
