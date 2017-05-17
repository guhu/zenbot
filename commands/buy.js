var minimist = require('minimist')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('conf')
  return function (program) {
    program
      .command('buy [selector]')
      .allowUnknownOption()
      .description('execute a buy order to the exchange')
      .option('--pct <pct>', 'buy with this % of currency balance', Number, c.buy_pct)
      .option('--size <size>', 'sell specific size of currency')
      .option('--markup_pct <pct>', '% to mark up ask price', Number, c.markup_pct)
      .option('--order_adjust_time <ms>', 'adjust bid on this interval to keep order competitive', Number, c.order_adjust_time)
      .option('--max_slippage_pct <pct>', 'avoid selling at a slippage pct above this float', c.max_slippage_pct)
      .action(function (selector, cmd) {
        var s = {options: minimist(process.argv)}
        var so = s.options
        delete so._
        Object.keys(c).forEach(function (k) {
          if (typeof cmd[k] !== 'undefined') {
            so[k] = cmd[k]
          }
        })
        so.buy_pct = cmd.pct
        so.selector = get('lib.normalize-selector')(selector || c.selector)
        so.mode = 'live'
        so.strategy = c.strategy
        so.stats = true
        var engine = get('lib.engine')(s)
        engine.executeSignal('buy', function (err, order) {
          if (err) {
            if (err.desc) console.error(err.desc)
            if (err.body) console.error(err.body)
            throw err
          }
          if (!order) {
            console.error('not enough currency balance to buy!')
          }
          process.exit()
        }, cmd.size)
        function checkOrder () {
          if (s.api_order) {
            s.exchange.getQuote({product_id: s.product_id}, function (err, quote) {
              if (err) {
                throw err
              }
              console.log('order status: ' + s.api_order.status + ', bid: ' + n(s.api_order.price).format('0.00') + ', ' + n(quote.bid).subtract(s.api_order.price).format('0.00') + ' below best bid, ' + n(s.api_order.filled_size).divide(s.api_order.size).format('0.00%') + ' filled')
            })
          }
          else {
            console.log('placing order...')
          }
        }
        setInterval(checkOrder, c.order_poll_time)
      })
  }
}