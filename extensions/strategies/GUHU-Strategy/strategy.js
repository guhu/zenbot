	{
		var z = require('zero-fill')
		  , n = require('numbro')
		  
		module.exports = function container (get, set, clear) {
		  return {
		    name: 'GUHU_Strategy',
		  description: 'Just do nothing. Can be used to e.g. generate candlesticks for training the genetic forex strategy.',

		    getOptions: function () {
	          this.option('last_action', 'start_value', String, null)
			  this.option('start', 'start_value', Number, null)
		      this.option('period', 'period length, same as --period_length', String, '5m')
		      this.option('period_length', 'period length, same as --period', String, '5m')
		      this.option('min_periods', 'min. number of history periods', Number, 1)
		      this.option('sell_immediatly', 'sell when the top drops at least below this percentage', Number, 6)
		      this.option('sell_threshold', 'sell when the top drops at least below this percentage', Number, 1)
		      this.option('sell_threshold_max', 'sell when the top drops at least below this percentage', Number, 2)
		      this.option('buy_threshold_max', 'buy when the bottom increased at least above this percentage', Number, 2)
		      this.option('stop_loss_thresold', 'buy when the bottom increased at least above this percentage', Number, 10)
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
			s.last_action=s.options.last_action
			}
			if (typeof s.start === 'undefined') {
				s.start= s.options.start
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
				s.stop_loss_counter= 2
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
			if (typeof s.last_value_4 === 'undefined') {
				s.last_value_4= s.period.high
			}
			if (typeof s.last_value_5 === 'undefined') {
				s.last_value_5= s.period.high
			}
			if (typeof s.last_value_6 === 'undefined') {
				s.last_value_6= s.period.high
			}
			if (typeof s.last_value_7 === 'undefined') {
				s.last_value_7= s.period.high
			}
			if (typeof s.last_value_8 === 'undefined') {
				s.last_value_8= s.period.high
			}
			if (typeof s.last_value_9 === 'undefined') {
				s.last_value_9= s.period.high
			}
			if (typeof s.last_value_10 === 'undefined') {
				s.last_value_10= s.period.high
			}
			if (typeof s.moy_last_3_value === 'undefined') {
				s.moy_last_3_value = null
			}
			if (typeof s.moy_last_10_value === 'undefined') {
				s.moy_last_10_value = null
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

			if (s.period.high > s.highest) {
				s.highest = s.period.high
			}
			
			if (s.lowest > s.period.high) {
				s.lowest = s.period.high
			}
			s.moy_last_3_value = (s.last_value_1 + s.last_value_2 + s.last_value_3) / 3
			s.moy_last_10_value = (s.last_value_1 + s.last_2_value + s.last_value_3 + s.last_value_4 + s.last_value_5 + s.last_value_6 + s.last_value_7 + s.last_value_8 + s.last_value_9 + s.last_value_10) / 10

			if( s.moy_last_10_value > (s.start + (s.start / 100 * 10 ))) {
				s.start = s.moy_last_10_value - (s.moy_last_10_value / 100 * s.options.sell_immediatly)
				s.highest = s.start
				s.lowest = s.start
			}
		},
			
		    onPeriod: function (s, cb) {		
////////////////////////////////////////////////////SPECIAL ACTION////////////////////////////////////////////////////
//----------------------------------------------------SELL IMMEDIATLY-------------------------------------------------
		s.price_immediatly_action = (s.start + (s.start / 100 * s.options.sell_immediatly))
		if(s.last_action === 'buy') {
			if(s.period.high >  s.price_immediatly_action){
					s.signal = 'sell'
					s.last_action = 'sell'
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
//----------------------------------------------------NORMAL SELL-------------------------------------------------
			s.future_action_sell = s.start + (s.start / 100 * s.options.sell_threshold_max) 
			if(s.period.high > s.future_action_sell) {
				s.buy_boolean=true
			}
			if(s.buy_boolean===true){
				s.future_action_sell = (s.highest - (s.highest / 100 * s.options.sell_threshold))
			   if(s.period.high < (s.highest - (s.highest / 100 * s.options.sell_threshold))) {
					s.signal = 'sell'
					s.last_action = 'sell'
					s.start = s.period.high
					s.highest = s.period.high
					s.lowest = s.period.high
					s.buy_boolean=false
					s.stop_loss_boolean = 'false'
					s.sell_immediatly_boolean = 'false'
					console.log(('\nNORMAL SELL = ' + s.period.high ).green)
					return cb()
				}
			}
//----------------------------------------------------STOP LOSS--------------------------------------------------
		s.stop_loss_value = (s.start - ((s.options.stop_loss_thresold  ) * s.start)/100)
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
				console.log(('\nSTOP LOSS LAUNCH - YOU RE DIED=' + s.period.high).red)
				return cb ()
			}
////////////////////////////////////////////////////BUY ACTION////////////////////////////////////////////////////
//--------------------------------------------------BUY AFTER SPECIAL ACTION--------------------------------------
			if(s.stop_loss_boolean === 'true'|| s.sell_immediatly_boolean === 'true' ) {
				if(s.last_action === 'sell') {
					s.future_action_value = (s.start - (s.start / 100 * s.options.buy_threshold)*4)
					if(s.period.high <  s.future_action_value) {
								s.signal = 'buy'
								s.last_action = 'buy'
								s.start = s.period.high
								s.highest = s.period.high
								s.lowest = s.period.high
								s.stop_loss = s.period.high
								s.stop_loss_boolean = 'false'
								s.sell_immediatly_boolean = 'false'
								s.stop_loss_counter =  2
								console.log(('\nBUY AFTER SPECIAL ACTION= ' + s.period.high).green)
								return cb()
							}
						}
			}						
//-----------------------------------------------NORMAL BUY----------------------------------------------
		s.future_action_buy = s.start - (s.start / 100 * s.options.buy_threshold_max)
		  if(s.stop_loss_boolean === 'false'|| s.sell_immediatly_boolean === 'false' ) {
			if(s.last_action === 'sell') {
			if(s.period.low < s.future_action_buy) {
						s.signal = 'buy'
						s.last_action = 'buy'
						s.start = s.period.low
						s.highest = s.period.high
						s.lowest = s.period.low
						s.stop_loss = s.period.high
						s.sell_immediatly_boolean = 'false'
						s.stop_loss_boolean = 'false'
						console.log(('\nNORMAL BUY= ' + s.period.high).green)
						return cb ()
					}
						
					}
						
				}
		}
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
			cols.push(z(8, n(s.stop_loss_value).format('0.00'), ' ')[color] + ' ')
		    cols.push(z(8, n(s.future_action_buy).format('0.00'), ' ')[color] + ' ')
		    cols.push(z(8, n(s.future_action_sell).format('0.00'), ' ')[color] + ' ')			
		    
		    return cols
		    }
		  }
		}
}
