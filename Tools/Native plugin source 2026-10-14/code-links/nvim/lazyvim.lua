return {
  { dir = vim.fn.expand('~/Projects/code-links/nvim'), name = 'code-links', lazy = false, config = function()require('code_links').setup()end },
  { 'saghen/blink.cmp', opts = function(_,opts)
    opts.sources=opts.sources or {};opts.sources.default=opts.sources.default or {'lsp','path','snippets','buffer'}
    table.insert(opts.sources.default,'code_links')
    opts.sources.providers=opts.sources.providers or {}
    opts.sources.providers.code_links={name='Code Links',module='code_links.completion',score_offset=100}
  end },
}
