local S={}
function S.new()return setmetatable({},{__index=S})end
function S:get_trigger_characters()return {'[','{','/'}end
function S:get_completions(ctx,cb)
  local m=require('code_links');local col=ctx.cursor[2];local before=ctx.line:sub(1,col)
  local a,op,q=before:match('()(%[%[)([^%]%[|#]*)$')
  if not a then a,op,q=before:match('()(%{%{)([^{}|#]*)$') end
  if not a or not m.context(ctx.bufnr,ctx.cursor[1]-1,a-1) then cb({items={}});return end
  local close=op=='{{' and '}}' or ']]';local endcol=col
  if ctx.line:sub(col+1,col+2)==close then endcol=col+2 end
  local root=m.root(vim.api.nvim_buf_get_name(ctx.bufnr))
  m.index(root,function(files)
    local items={}
    for _,f in ipairs(files) do
      if op~='{{' or f.code then
        items[#items+1]={label=f.target,filterText=f.target,kind=17,labelDetails={description=f.label},textEdit={newText=op..f.target..close,range={start={line=ctx.cursor[1]-1,character=a-1},['end']={line=ctx.cursor[1]-1,character=endcol}}}}
      end
    end
    cb({items=items,is_incomplete_forward=true,is_incomplete_backward=true})
  end)
end
return S
