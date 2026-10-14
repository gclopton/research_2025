vim.opt.rtp:prepend('/Users/gradyclopton/Projects/code-links/nvim')
local m=require('code_links')
assert(vim.fn.filereadable(m.core)==1,m.core)
local lab='/Users/gradyclopton/ObsidianVaults/code_links_lab'
vim.cmd('edit '..lab..'/scripts/analyze.py');vim.bo.filetype='python';vim.bo.commentstring='# %s'
assert(m.context(0,1,20));assert(not m.context(0,5,8))
assert(#m.links('# {{a.py|a}} and [[b.py|b]]')==2)
local finished=false
m.open(lab,'{{results/OUTCAR#L2800-L3500|Evidence}}',vim.NIL)
assert(vim.wait(5000,function()return vim.b.code_links_excerpt~=nil end,20),'excerpt timed out')
assert(vim.api.nvim_buf_line_count(0)==701)
assert(vim.b.code_links_excerpt.start==2800)
assert(not vim.bo.modifiable and vim.bo.readonly)
assert(vim.api.nvim_win_get_config(0).relative=='','excerpt must not float')
assert(vim.api.nvim_win_get_width(0)==vim.o.columns,'excerpt must fill editor width')
vim.api.nvim_win_set_cursor(0,{3,0});m.open_source()
assert(vim.wait(5000,function()return vim.b.code_links_excerpt==nil end,20))
assert(vim.api.nvim_buf_get_name(0)==lab..'/results/OUTCAR')
assert(vim.api.nvim_win_get_cursor(0)[1]==2802)
vim.cmd('edit '..lab..'/scripts/analyze.py');vim.bo.filetype='python';vim.bo.commentstring='# %s'
local src=require('code_links.completion').new()
local line='# {{anal'
src:get_completions({bufnr=vim.api.nvim_get_current_buf(),cursor={2,#line},line=line},function(r)
 assert(#r.items>0);assert(r.items[1].textEdit.range.start.character==2);finished=true
end)
assert(vim.wait(5000,function()return finished end,20),'completion timeout')
-- Exercise real link following, duplicate names, and inert executable strings.
vim.cmd('edit '..lab..'/demo/start.py');vim.bo.filetype='python';vim.bo.commentstring='# %s'
vim.api.nvim_win_set_cursor(0,{3,25});m.follow()
assert(vim.wait(5000,function()return vim.api.nvim_buf_get_name(0)==lab..'/demo/helper.js' end,20))
vim.bo.filetype='javascript';vim.bo.commentstring='// %s'
vim.api.nvim_win_set_cursor(0,{2,22});m.follow()
assert(vim.wait(5000,function()return vim.api.nvim_buf_get_name(0)==lab..'/demo/alternate/helper.js' end,20))
assert(vim.api.nvim_buf_get_lines(0,0,1,false)[1]:find('ALTERNATE'))
vim.cmd('edit '..lab..'/demo/start.py');vim.bo.filetype='python';vim.bo.commentstring='# %s'
vim.api.nvim_win_set_cursor(0,{13,25});assert(m.current()==nil,'string link activated')
print('PASS: comment context, links, readonly 701-line excerpt, original source line, completion')
vim.cmd('qa!')
