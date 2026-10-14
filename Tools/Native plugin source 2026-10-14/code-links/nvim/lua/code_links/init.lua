local M = { indexes = {}, jobs = {} }
local ns = vim.api.nvim_create_namespace('code-links')
local here = debug.getinfo(1, 'S').source:sub(2)
M.core = vim.fs.normalize(vim.fs.dirname(here) .. '/../../../core/code_links.py')
local function notice(s) vim.notify(s, vim.log.levels.INFO, { title = 'Code Links' }) end
function M.root(path)
  path = path or vim.api.nvim_buf_get_name(0)
  if path == '' then return vim.uv.cwd() end
  return vim.fs.root(path, { '.code-links.json', '.git', '.obsidian' }) or vim.fs.dirname(path)
end
function M.call(args, cb)
  local job
  job = vim.system({ '/usr/bin/env', 'python3', M.core }, { stdin = vim.json.encode(args), text = true, timeout = 120000 }, function(out)
    vim.schedule(function()
      M.jobs[job] = nil
      local ok, data = pcall(vim.json.decode, out.stdout or '')
      if not ok or not data.ok then cb(nil, ok and data.error or ('Reader failed: ' .. (out.stderr or ''))); return end
      cb(data.result)
    end)
  end)
  M.jobs[job] = true
  return job
end
function M.index(root, cb, force)
  local entry = M.indexes[root]
  if entry and not force and os.time() - entry.at < 30 then cb(entry.items); return end
  if entry and entry.wait then table.insert(entry.wait, cb); return end
  local wait = { cb };M.indexes[root] = { wait = wait, items = entry and entry.items or {}, at = 0 }
  M.call({ cmd = 'index', root = root }, function(r, err)
    M.indexes[root] = { items = r and r.items or {}, at = r and os.time() or 0 }
    for _, fn in ipairs(wait) do fn(M.indexes[root].items) end
    if err then notice(err) end
  end)
end
function M.context(buf, row, col)
  local ft = vim.bo[buf].filetype
  if ft == '' or ft == 'text' or ft == 'markdown' then return true end
  local ok, node = pcall(vim.treesitter.get_node, { bufnr = buf, pos = { row, math.max(0, col) } })
  if ok then
    while node do
      if node:type():lower():find('comment') then return true end
      node = node:parent()
    end
  end
  local name = vim.fn.synIDattr(vim.fn.synID(row+1, col+1, 1), 'name'):lower()
  if name:find('comment') then return true end
  -- Conservative fallback: only a whole comment line, never a quoted inline token.
  local prefix = (vim.bo[buf].commentstring or ''):match('^(.-)%%s')
  local line = vim.api.nvim_buf_get_lines(buf,row,row+1,false)[1] or ''
  return prefix ~= nil and #vim.trim(prefix)>0 and vim.trim(line):sub(1,#vim.trim(prefix))==vim.trim(prefix)
end
function M.links(line)
  local out = {}
  for _, pat in ipairs({ '()%!?%{%{.-%}%}()', '()%!?%[%[.-%]%]()' }) do
    for a,b in line:gmatch(pat) do out[#out+1]={a=a-1,b=b-1,raw=line:sub(a,b-1)} end
  end
  table.sort(out,function(a,b)return a.a<b.a end);return out
end
function M.current()
  local cur=vim.api.nvim_win_get_cursor(0);local line=vim.api.nvim_get_current_line()
  for _, l in ipairs(M.links(line)) do
    if cur[2]>=l.a and cur[2]<l.b and M.context(0,cur[1]-1,l.a) then return l end
  end
end
function M.decorate()
  local buf=vim.api.nvim_get_current_buf()
  if vim.bo[buf].buftype~='' then return end
  vim.api.nvim_buf_clear_namespace(buf,ns,0,-1)
  local first,last=vim.fn.line('w0')-1,vim.fn.line('w$')
  for i,line in ipairs(vim.api.nvim_buf_get_lines(buf,first,last,false)) do
    for _,l in ipairs(M.links(line)) do
      if M.context(buf,first+i-1,l.a) then
        local opts={end_col=l.b,hl_group='CodeLinksLink',priority=150}
        vim.api.nvim_buf_set_extmark(buf,ns,first+i-1,l.a,opts)
        local pipe=l.raw:find('|',1,true)
        if pipe then
          vim.api.nvim_buf_set_extmark(buf,ns,first+i-1,l.a,{end_col=l.a+pipe,conceal='',priority=160})
          vim.api.nvim_buf_set_extmark(buf,ns,first+i-1,l.b-2,{end_col=l.b,conceal='',priority=160})
        end
      end
    end
  end
end
function M.open_source()
  local d=vim.b.code_links_excerpt
  if not d then return end
  local row=vim.api.nvim_win_get_cursor(0)[1]
  local line=d.line_numbers and d.line_numbers[row] or d.start+row-1
  if line==vim.NIL then notice('Select a source line, not an omission marker');return end
  M.open(d.root,d.raw,line,'current','source',d.signature)
end
function M.open(root, raw, source_line, destination, action, expected_signature)
  -- JSON null is vim.NIL (truthy), not a usable line number.
  source_line = type(source_line) == "number" and source_line or nil
  expected_signature=type(expected_signature)=='table' and expected_signature or nil
  destination=type(destination)=='string' and destination or 'current'
  action=type(action)=='string' and action or 'auto'
  M.call({cmd='read',root=root,raw=raw},function(r,err)
    if not r then notice(err);return end
    if expected_signature and not vim.deep_equal(expected_signature,r.signature) then
      notice('Source changed since preview; refresh before navigating');return
    end
    -- New tabs inherit window options, including an existing excerpt's column.
    local previous_column=vim.w.code_links_previous_statuscolumn or vim.wo.statuscolumn
    destination=destination or 'current';action=action or 'auto'
    if r.application and action~='folder' and action~='source' then
      M.call({cmd='launch',root=root,raw=raw,action=action},function(_,e)if e then notice(e)end end);return
    end
    if destination=='split' then vim.cmd('vsplit') elseif destination=='tab' then vim.cmd('tabnew') end
    if action=='folder' or r.directory then
      local dir=r.directory and r.path or vim.fs.dirname(r.path)
      if _G.Snacks and Snacks.explorer then Snacks.explorer({cwd=dir})
      else vim.cmd('edit '..vim.fn.fnameescape(dir)) end
      return
    end
    if action=='source' and not source_line then source_line=r.start or 1 end
    if r.full or source_line then
      vim.cmd('edit '..vim.fn.fnameescape(r.path))
      if source_line then
        -- An explicit linked line wins over LazyVim's delayed last-position restore.
        vim.b.lazyvim_last_loc=true
        vim.api.nvim_win_set_cursor(0,{math.min(source_line,vim.api.nvim_buf_line_count(0)),0})
      end
      return
    end
    local buf=vim.api.nvim_create_buf(false,true)
    vim.api.nvim_buf_set_lines(buf,0,-1,false,r.lines)
    vim.bo[buf].bufhidden='wipe';vim.bo[buf].swapfile=false
    vim.b[buf].code_links_excerpt={path=r.path,start=r.start,root=root,raw=raw,line_numbers=r.line_numbers,signature=r.signature}
    vim.bo[buf].filetype=vim.filetype.match({filename=r.path}) or 'text'
    vim.bo[buf].modifiable=false;vim.bo[buf].readonly=true
    -- A focused editor tab, never a floating popup over the dashboard.
    if destination=='current' or destination=='window' then vim.cmd('tabnew') end
    local win=vim.api.nvim_get_current_win()
    vim.api.nvim_win_set_buf(win,buf)
    vim.api.nvim_buf_set_name(buf,'code-links://'..buf..'/'..vim.fs.basename(r.path)..':'..r.start..'-'..r['end'])
    vim.wo[win].winhighlight='Normal:CodeLinksExcerpt,FloatBorder:CodeLinksLink'
    vim.wo[win].number=true;vim.wo[win].relativenumber=false;vim.wo[win].wrap=false
    -- v:lua module calls require the single-quoted, parenthesis-free form.
    local column="%{v:lua.require'code_links'.line_number(v:lnum)} "
    vim.api.nvim_set_option_value('statuscolumn',column,{win=win,scope='local'})
    vim.w[win].code_links_previous_statuscolumn=previous_column
    vim.api.nvim_create_autocmd('BufWinLeave',{buffer=buf,callback=function()
      local leaving=vim.api.nvim_get_current_win()
      if vim.wo[leaving].statuscolumn==column then
        vim.api.nvim_set_option_value('statuscolumn',previous_column,{win=leaving,scope='local'})
        vim.w[leaving].code_links_previous_statuscolumn=nil
      end
    end})
    vim.keymap.set('n','q',function()
      if #vim.api.nvim_list_tabpages()>1 then vim.cmd('tabclose') else vim.cmd('enew') end
    end,{buffer=buf,desc='Close excerpt'})
    vim.keymap.set('n','<CR>',M.open_source,{buffer=buf,desc='Open source at this line'})
    vim.keymap.set('n','<leader>oe',M.open_source,{buffer=buf,desc='Open source at this line'})
  end)
end
function M.line_number(row)
  local d=vim.b.code_links_excerpt
  local n=d and d.line_numbers and d.line_numbers[row]
  return n and n~=vim.NIL and tostring(n) or '·'
end
function M.follow()
  local l=M.current();if not l then notice('Place cursor on a link in a comment or text');return end
  vim.cmd("normal! m'");M.open(M.root(),l.raw)
end
function M.track(first,last)
  local file=vim.api.nvim_buf_get_name(0);local root=M.root(file)
  if vim.bo.modified then notice('Save this file before creating an evidence link');return end
  local rel=vim.fs.relpath(root,file)
  if not rel then notice('File is outside project');return end
  M.call({cmd='anchor',root=root,raw='{{'..rel..'#L'..first..'-L'..last..'|'..vim.fs.basename(file)..'}}'},function(r,err)
    if not r then notice(err);return end
    vim.fn.setreg('+',r.link);notice('Tracked excerpt link copied')
  end)
end
function M.backlinks()
  local root=M.root();local rel=vim.fs.relpath(root,vim.api.nvim_buf_get_name(0))
  M.call({cmd='backlinks',root=root,target=rel},function(r,err)
    if not r then notice(err);return end
    local items={};for _,x in ipairs(r) do items[#items+1]={filename=x.path,lnum=x.line,text=x.text} end
    vim.fn.setqflist(items,'r');vim.cmd('copen')
  end)
end
function M.rename()
  for _,b in ipairs(vim.api.nvim_list_bufs()) do if vim.bo[b].modified then notice('Save or close modified buffers before managed rename');return end end
  local root=M.root();local old=vim.fs.relpath(root,vim.api.nvim_buf_get_name(0))
  vim.ui.input({prompt='New project-relative path: ',default=old},function(new)
    if not new or new==old then return end
    M.call({cmd='rename',root=root,old=old,new=new},function(plan,err)
      if not plan then notice(err);return end
      vim.ui.select({'Rename and update '..#plan.references..' referencing files','Cancel'},{prompt='Managed rename (recovery copies retained)'},function(_,idx)
        if idx~=1 then return end
        M.call({cmd='rename',root=root,old=old,new=new,apply=true},function(r,e)
          if not r then notice(e);return end
          vim.cmd('edit '..vim.fn.fnameescape(root..'/'..new));vim.cmd('checktime');M.indexes[root]=nil;notice('Renamed; recovery: '..r.recovery)
        end)
      end)
    end)
  end)
end
function M.receive(path)
  local f=io.open(path);if not f then return false end
  local req=vim.json.decode(f:read('*a'));f:close();os.remove(path)
  vim.schedule(function()M.open(req.root,req.raw,req.source_line,req.destination,req.action,req.expected_signature)end)
  return true
end
function M.setup()
  if M.ready then return end;M.ready=true
  vim.filetype.add({filename={OUTCAR="code_links_output"}})
  vim.api.nvim_set_hl(0,'CodeLinksLink',{fg='#7dcfff',ctermfg=117,underline=true})
  vim.api.nvim_set_hl(0,'CodeLinksExcerpt',{bg='#182638',ctermbg=234})
  local cache=vim.fn.expand('~/.cache/code-links');vim.fn.mkdir(cache,'p')
  local socket=vim.v.servername
  if socket=='' then socket=vim.fn.serverstart(cache..'/nvim-'..vim.fn.getpid()..'.sock') end
  local terminal=vim.env.TERM_PROGRAM=='iTerm.app' and 'iTerm' or 'Terminal'
  vim.fn.writefile({vim.json.encode({socket=socket,pid=vim.fn.getpid(),terminal=terminal})},cache..'/nvim.json')
  vim.api.nvim_create_user_command('CodeLinksFollow',M.follow,{})
  vim.api.nvim_create_user_command('CodeLinksBacklinks',M.backlinks,{})
  vim.api.nvim_create_user_command('CodeLinksTrack',function(o)M.track(o.line1,o.line2)end,{range=true})
  vim.api.nvim_create_user_command('CodeLinksRename',M.rename,{})
  vim.api.nvim_create_user_command('CodeLinksRefresh',function()M.index(M.root(),function()notice('File index refreshed')end,true)end,{})
  vim.keymap.set('n','<leader>ol',M.follow,{desc='Follow code/text link'})
  vim.keymap.set('n','<leader>ob',M.backlinks,{desc='Code Links backlinks'})
  vim.keymap.set('v','<leader>ot',":CodeLinksTrack<CR>",{desc='Copy tracked excerpt link'})
  vim.keymap.set('n','<leader>or',M.rename,{desc='Code Links managed rename'})
  local group=vim.api.nvim_create_augroup('CodeLinks',{clear=true})
  vim.api.nvim_create_autocmd({'BufEnter','WinScrolled','TextChanged','TextChangedI','CursorMoved'},{group=group,callback=function()
    if not M.pending then M.pending=true;vim.defer_fn(function()M.pending=false;pcall(M.decorate)end,60) end
  end})
  vim.api.nvim_create_autocmd('BufEnter',{group=group,callback=function()
    if vim.bo.buftype=='' then vim.wo.conceallevel=2;vim.wo.concealcursor='';M.index(M.root(),function()end) end
  end})
  vim.api.nvim_create_autocmd('BufWritePost',{group=group,callback=function()M.indexes[M.root()]=nil end})
  vim.api.nvim_create_autocmd('VimLeavePre',{group=group,callback=function()for j in pairs(M.jobs) do j:kill(15) end end})
end
return M
