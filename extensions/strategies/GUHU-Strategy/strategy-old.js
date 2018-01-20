var z = require('zero-fill')
  , n = require('numbro')
  
module.exports = function container (get, set, clear) {
  return {
    name: 'GUHU_Strategy',
  description: 'Just do nothing. Can be used to e.g. generate candlesticks for training the genetic forex strategy.',

    getOptions: function () {
      this.option('period', 'period length, same as --period_length', String, '10m')
      this.option('period_length', 'period length, same as --period', String, '10m')
      this.option('min_periods', 'min. number of history periods', Number, 52)
      this.option('sell_immediatly', 'sell when the top drops at least below this percentage', Number, 6)
      this.option('sell_threshold', 'sell when the top drops at least below this percentage', Number, 2)
      this.option('sell_threshold_max', 'sell when the top drops at least below this percentage', Number, 3)
      this.option('buy_threshold', 'buy when the bottom increased at least above this percentage', Number, 3)
      this.option('stop_loss_thresold', 'buy when the bottom increased at least above this percentage', Number, 5)
      this.option('ema_short_period', 'number of periods for the shorter EMA', Number, 12)
      this.option('ema_long_period', 'number of periods for the longer EMA', Number, 26)
      this.option('signal_period', 'number of periods for the signal EMA', Number, 9)
      this.option('up_trend_threshold', 'threshold to trigger a buy signal', Number, 50 )
      this.option('down_trend_threshold', 'threshold to trigger a sold signal', Number, 1)
      this.option('overbought_rsi_periods', 'number of periods for overbought RSI', Number, 25)
      this.option('overbought_rsi', 'sold when RSI exceeds this value', Number,30 )
    },

    calculate: function (s) {
//DÃclaration initiale des Variables.
	  if (typeof s.last_action === 'undefined') {
        s.last_action= null
      }
	  if (typeof s.start === 'undefined') {
        s.start= s.period.high
      }  
          if (typeof s.highest === 'undefined') {
        s.highest= s.period.high
      }  
	  if (typeof s.lowest === 'undefined') {
        s.lowest= s.period.high
      } 
          if (typeof s.start === 'undefined') {
        s.start= s.period.high
      }
	  if (typeof s.stop_loss === 'undefined') {
              s.stop_loss= s.period.high
      }
	  if (typeof s.stop_loss_counter === 'undefined') {
	      s.stop_loss_counter= 3
      }
	 if (typeof s.last_value_1 === 'undefined') {
        s.last_value_1= s.period.high
      }
	 if (typeof s.last_value_2 === 'undefined') {
        s.last_value_2= s.period.high
      }
	 if (typeof s.last_value_3 === 'undefined') {
        s.last_value_3= s.period.high
      }
	 if (typeof s.moy_last_3_value === 'undefined') {
        s.moy_last_3_value = null
      }
         if (typeof  s.stop_loss_boolean === 'undefined') {
	 s.stop_loss_boolean = 'false'
      }
         if (typeof  s.sell_immediatly_boolean === 'undefined') {
	 s.sell_immediatly_boolean = 'false'
      }
	 if (  s.sell_immediatly_add_value === 'undefined') {
          s.sell_immediatly_add_value === '1'
      }
	 if (typeof s.stop_loss_value === 'undefined') {
         s.stop_loss_value = null
      }
         if (typeof s.last_action_value === 'undefined') {
	 s.last_action_value = 'init'
      }

//Si le plus haut de la pÃriode est supÃrieur a la variable Highest. On remplace la valeur.
	if (s.period.high > s.highest) {
        s.highest = s.period.high
      }
//Si le plus haut de la pÃ©riode estinfÃrieur a la variable lowest. On remplace la valeur.
	   
	if (s.lowest > s.period.high) {
        s.lowest = s.period.high
      }
	    s.moy_last_3_value = (s.last_value_3 + s.last_2_value + s.last_1_value) / 3
        if (s.options.overbought_rsi) {
	  // sync RSI display with overbought RSI periods
	  s.options.rsi_periods = s.options.overbought_rsi_periods
	  get('lib.rsi')(s, 'overbought_rsi', s.options.overbought_rsi_periods)
 
        if (!s.in_preroll && s.period.overbought_rsi >= s.options.overbought_rsi && !s.overbought) {
	   s.overbought = true
                   }
       }
    // compture MACD
                  get('lib.ema')(s, 'ema_short', s.options.ema_short_period)
	          get('lib.ema')(s, 'ema_long', s.options.ema_long_period)
	if (s.period.ema_short && s.period.ema_long) {
	    s.period.macd = (s.period.ema_short - s.period.ema_long)
	    get('lib.ema')(s, 'signal', s.options.signal_period, 'macd')
        if (s.period.signal) {
            s.period.macd_histogram = s.period.macd - s.period.signal
          }
       }

    },
	
    onPeriod: function (s, cb) {
	 s.price_immediatly_action = (s.start + (s.start / 100 * s.options.sell_immediatly))
         if(s.last_action !== 'sell') {
	    if(s.period.high > (s.start + (s.start / 100 * s.options.sell_immediatly))) {
	       s.signal = 'sell'
	       s.last_action = 'sell'
	       s.price_before_sell=s.start
	       s.start = s.period.high
	       s.highest = s.period.high
	       s.lowest = s.period.high
	       s.sell_immediatly_boolean = 'true'
	       s.stop_loss_boolean = 'false'
	       s.sell_immediatly_boolean = 'true'
	       console.log(('\nSELL IMMEDIATLY REACH:'+ s.options.sell_immediatly + '.').green)
	       return cb()
				                           }
	    }

	    //Si le cours augmente au minimum de 3% et qu'il ne rebaisse pas en dessous de 2% du maiximum.
	if(s.last_action !== 'sell') {
	s.price_future_action = s.start + (s.start / 100 * s.options.sell_threshold_max)
          if(s.period.high > (s.start + (s.start / 100 * s.options.sell_threshold_max))) {
	     if((s.period.high < (s.highest - (s.highest / 100 * s.options.sell_threshold)))) {
                s.signal = 'sell'
                s.last_action = 'sell'
                s.start = s.period.high
                s.highest = s.period.high
                s.lowest = s.period.high
	        s.stop_loss_boolean = 'false'
		s.sell_immediatly_boolean = 'false'
		console.log(('\nNORMAL SELL').green)
	     return cb()
	 }
      	}
       }

// Si le cours chute butalement de X% on vend tout. Et on stoppe toutes transactions.
 s.stop_loss_value = (s.start - ((s.options.stop_loss_thresold  ) * s.start)/100)

       if(s.last_action !== 'sell') {
	 if(s.period.high < s.stop_loss_value ){
	      s.stop_loss_counter --
             }
	       else { 
		s.stop_loss_counter =3
	       }

	  if(s.stop_loss_counter <= 0) {
              s.signal = 'sell'
	      s.last_action = 'sell'
              s.start = s.period.high
              s.highest = s.period.high
              s.lowest = s.period.high
	      s.stop_loss = s.period.high
	      s.stop_loss_boolean = 'true'
	      s.sell_immediatly_boolean = 'false'
              console.log(('\nSTOP LOSS LAUNCH - YOU RE DIED').red)
            return cb ()
	    }
	 }
       
      
	    
      if(s.stop_loss_boolean === 'true') {
	  if(s.last_action !== 'buy') {
             s.future_action_value = (s.start - (s.start / 100 * s.options.buy_threshold)*2)
	     if(s.period.high <  s.future_action_value) {    
                if (typeof s.period.macd_histogram === 'number' && typeof s.lookback[0].macd_histogram === 'number') {
	        if ((s.period.macd_histogram - s.options.up_trend_threshold) > 0 && (s.lookback[0].macd_histogram - s.options.up_trend_threshold) <= 0) {
		     s.signal = 'buy';
		      s.last_action = 'buy'
		      s.start = s.period.high
		      s.highest = s.period.high
		      s.lowest = s.period.high
		      s.stop_loss = s.period.high
		      s.stop_loss_boolean = 'false'
		      s.stop_loss_counter =  3
		      console.log(('\nQUIT STOP LOSS WITH BUY ORDER').green)
		      return cb()
	     } 
           }
	 }
      }
     }
	    
       if(s.stop_loss_boolean === 'false') {
	  if(s.sell_immediatly_boolean === 'true') {
	    s.start = s.price_before_sell
	  }

	  
          if(s.last_action !== 'buy') {
             if(s.stop_loss_boolean === 'false') {
                if(s.sell_immediatly_boolean === 'true') {
	           s.start = s.price_before_sell
	 }
	  s.future_action_value = s.start - (s.start / 100 * s.options.buy_threshold)
          if(s.period.high <  s.future_action_value) {
             if (typeof s.period.macd_histogram === 'number' && typeof s.lookback[0].macd_histogram === 'number') {
               if ((s.period.macd_histogram - s.options.up_trend_threshold) > 0 && (s.lookback[0].macd_histogram - s.options.up_trend_threshold) <= 0) {
              s.signal = 'buy'
              s.last_action = 'buy'
              s.start = s.period.high
              s.highest = s.period.high
              s.lowest = s.period.high
	      s.stop_loss = s.period.high
              s.sell_immediatly_boolean = 'false'
	      s.stop_loss_boolean = 'false'
              console.log(('\nNORMAL BUY').green)
	    return cb ()
           }
	 }
       }
     }
   }
  }			 
        s.moy_start = (s.period.high / s.start)
        s.last_value_3 = s.last_value_2
        s.last_value_2 = s.last_value_1
        s.last_value_1 = s.period.high

        return cb()
   },

    onReport: function (s) {
    var cols = []
    var color = 'grey'
    var action = ''

    if(s.period.high > s.start) {
        color = 'green'
      }
    else if (s.period.high < s.start) {
        color = 'red'
      }
   
    cols.push(z(8, n(s.period.high).format('0.00'), ' ')[color] + ' ')
    cols.push(z(8, n(s.start).format('0.00'), ' ').yellow + ' ')
    cols.push(z(8, n(s.future_action_value).format('0.00'), ' ')[color] + ' ')	    
    cols.push(z(8, n(s.stop_loss_value).format('0.00'), ' ')[color] + ' ')
    return cols
    }
  }
}


