/*
 * Copyright (C) 2011  Guillaume Bour <gbour@proformatique.com>, Proformatique
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function($) {
	$.widget("xivo.schedule", {
		// default options
		options: {
			language  : 'en',
			timeformat: '24',
			inputs: {
				'months'   : null,
				'monthdays': null,
				'weekdays' : null,
				'hours'    : null
			},

			defaults: {
				'months'   : '1-12',
				'monthdays': '1-31',
				'weekdays' : '1-5',
				'hours'    : '00:00-23:59'
			}
		},

		sliderOptions: {
			orientation: 'vertical',
			step: 1,
			min: 0,
			max: 1439, //24*60
			range: true,
			values: [0,1440]
		},

		// create widget
		_create: function() {
			this._i18n = this._l10n[this.options['language']];

			this.node = this._initHtml();
			this.element.addClass('schedule');

			//offset = this.element.offset();
			//offset['top']  += this.element.outerHeight();
			//this.node.offset(offset);
			this.node.offset({top:0, left:0});

			for(var i in this.options['inputs'])
				//this.onChange(i); 
				this._fieldInit(i);

			var _this = this;
			this.element.bind('click', function() { 
				/* we hide all pickers but ours */
				$('.ui-datepicker').each(function(idx, elt) {
					if(elt != _this.node[0])
						$(elt).hide();
				});

				_this.node.toggle(); 
				//WARNING: setting offset position ONLY works when element is visible !!!
				if($(_this.node).is(':visible'))	{
					offset 				  = _this.element.offset();
					offset['top']  += _this.element.outerHeight();
					_this.node.offset(offset);
				}

				
			});

			// on title bar
			this.node.children().first().bind('click', function() { _this.node.hide(); });
		},

		destroy: function() {
			$.Widget.prototype.destroy.apply(this,arguments);
		},

		_initHtml: function() {
			var widget = this;
			var node = $(this._html);

			node.find('#title').html(this._i18n['title']);

			// months
			var ul = node.find('ul#months');
			ul.prev().html(this._i18n['months']);

			for(var i = 0; i < 12; i++) {
				li = $('<li class="AnyTime-btn AnyTime-mon-btn AnyTime-mon2-btn ui-state-default ui-state-highlight">' + 
					this._i18n['mAbbr'][i] + '</li>')

					li.click(function() { 
					$(this).toggleClass('ui-state-highlight'); 
					widget.onChange('months');
				});

				ul.append(li);
			}

			// months :: all button
			var li = $('<li class="AnyTime-btn AnyTime-mon-btn AnyTime-mon2-btn ui-state-default ui-state-disabled" state="none">'+this._i18n['none']+'</li>');
			li.click(function() {
				var state = $(this).attr('state');
				ul.children().each(function(idx,elt) {
					if(state == 'none')
						$(elt).removeClass('ui-state-highlight');
					else
						$(elt).addClass('ui-state-highlight');
				});

				state = state=='none'?'all':'none';
				$(this).attr('state', state).html(widget._i18n[state]);
				widget.onChange('months');
			}); 
			ul.append(li);

			// monthdays
			node.find('#md-title').html(this._i18n['monthdays']);
			node.find('#monthdays').children().each(function(index, elt) {
				var i = 1 + index*7;

				for(var j = i; j < i+7; j++) {
					var td = $('<td class="AnyTime-btn AnyTime-dom-btn AnyTime-dom-btn-filled ui-state-default ui-state-highlight">' + j + '</td>');

					if(j > 31) {
						td.addClass('ui-state-disabled').empty();

						// all/none button
						if(j == 35)
						{ 
							td.html(widget._i18n['none']).attr('state','none'); 
							td.click(function() {
								var state = $(this).attr('state');
								node.find('#monthdays td:not(.ui-state-disabled)').each(function(idx,elt) {
									if(state == 'none')
										$(elt).removeClass('ui-state-highlight');
									else
										$(elt).addClass('ui-state-highlight');
								});

								state = state=='none'?'all':'none';
								$(this).attr('state', state).html(widget._i18n[state]);
								widget.onChange('months');
							}); 
						}
					}

					td.click(function() { 
						$(this).toggleClass('ui-state-highlight'); 
						widget.onChange('monthdays');
					});
					$(elt).append(td);
				}
			});

			// weekdays
			var wdays = node.find('#weekdays');
			wdays.prev().html(this._i18n['weekdays']);

			wdays.children().each(function(idx, elt) {
				$(elt).click(function() { 
					$(this).toggleClass('ui-state-highlight'); 
					widget.onChange('weekdays');
				});
				$(elt).html(widget._i18n['dAbbr'][idx]);

			});

			node.find('#weekdays-all').html(widget._i18n['all']).click(function() {
				var state = $(this).attr('state');
				wdays.children().each(function(idx,elt) {
					if(state == 'none')
						$(elt).removeClass('ui-state-highlight');
					else
						$(elt).addClass('ui-state-highlight');
				});

				state = state=='none'?'all':'none';
				$(this).attr('state', state).html(widget._i18n[state]);
				widget.onChange('weekdays');
			}); 

			// hours
			var slider = node.find('#slider');
			slider.prev().html(widget._i18n['hours']);
			slider.first().slider(this.sliderOptions);
			slider.children('a').each(function(idx, elt) {
				if(idx == 1)
					{	id  = 'range-end'; lbl = '23:59'; }
				else
					{ id  = 'range-start'; lbl = '00:00'; }

				var span = $('<span id="'+id+'" class="ui-slider-tooltip ui-widget-content ui-corner-all" style="position: relative; left: 20px;" iso-hour="'+lbl+'">'+lbl+'</span>');
				$(elt).css('color','transparent');
				$(elt).append(span);

				$(elt).mousewheel(function(e, d, dX, dY) {
					value = slider.slider('values')[idx];
					slider.slider('values', idx, value + dY);
				});
			});

			onSlide = function(e, ui) {
				var positions = ['start','end'];
				for(var i in positions)
				{
					var val = ui.values[i];
					var hour = Math.floor(val/60);
					var min  = (val-(60 * hour));

					hour = hour < 10?'0'+hour:hour;
					min  = min  < 10?'0'+min:min;

					//$('#range-'+positions[i]).html(hour+':'+min).attr('iso-hour', hour+':'+min);
					node.find('#range-'+positions[i]).html(hour+':'+min).attr('iso-hour', hour+':'+min);
				}

				if(e.type == 'slidechange')
					{ widget.onChange('hours'); }

				return true;
			},

			slider.bind('slide', onSlide);
			slider.bind('slidechange', onSlide);


			// add our popup to main html DOM
			$('body').append(node);
			return node;
		},

		/* called each time an item value is changed: months selection, hours interval,
		 * ...
		 *
		 * onChange update:
		 *  . textual description
		 *  . raw value
		 * */
		onChange: function(item) {
			if(this.options['inputs'][item] == null) 
				return;

			_clbk1 = function(elts) {
				var value = '';
				var start = idx = null;

				elts.each(function(idx, elt) {
					if($(elt).hasClass('ui-state-highlight') && !$(elt).hasClass('ui-state-disabled')) {
						//value += ',' + (idx+1);
						if(start == null)
							start = idx+1;
					}	else if(start == idx) {
						value += ',' + start; start = null;
					} else if(start != null) {
						value += ',' + start + '-' + idx; start = null;
					}
				});

				if(start == idx-1)
					value += ',' + start;
				else if(start != null)
					value += ',' + start + '-' + idx; 
					
				value = value.substring(1);
				return value;
			};

			// hours special callback
			var node = this.node;
			_clbk2 = function() {
				return node.find('#range-start').attr('iso-hour') + '-' + 
							 node.find('#range-end').attr('iso-hour');
			};

			clbks = {
				'months'   : "_clbk1(this.node.find('#months').children())",
				'monthdays': "_clbk1(this.node.find('#monthdays').find('td'))",
				'weekdays' : "_clbk1(this.node.find('#weekdays').children())",
				'hours'    : "_clbk2()",
			}

			this.options['inputs'][item].attr('value', eval(clbks[item]));

			// textual representation
			var h = this.options['inputs']['hours'].attr('value').split('-');
			var txt = '';
			if(h.length == 2)
				txt += this._i18n['fullText'][0] + h[0].replace(':','h') + ' ' +
				 	this._i18n['fullText'][1] + ' ' + h[1].replace(':','h');

			var wd = this.options['inputs']['weekdays'].attr('value').split(',');
			if(wd[0].length > 0)
			{
				txt += ', ' + this._i18n['fullText'][2];
				for(var i in wd)
				{
					var elts = wd[i].split('-');
					txt += this._i18n['dAbbr'][elts[0]-1]
					if(elts.length > 1)
						txt += ' ' + this._i18n['fullText'][3] + ' ' + this._i18n['dAbbr'][elts[1]-1];
					txt += ', '
				}
				txt = txt.substr(0, txt.length - 2);
			} else {
				txt += ', Aucun jours de la semaine';
			}
			txt += ', ...';

			// will depend of the type of the element
			this.element.html(txt).attr('value', txt);
		},

		_fieldInit: function(item) {
			if(this.options['inputs'][item] == null) 
				return;

			var value = this.options['inputs'][item].attr('value');
			if(value.length == 0)
				value = this.options['defaults'][item];
			if(value.length == 0)
				return;

			// split rules: a-b,c => [a,..,b,c,..,d]
			//              a:b-c:d => [(a,b),(c,d)]      (hours)
			if(item == 'hours')	{
				value = jQuery.map(value.split('-'), function(elt) {
					hm = elt.split(':');
					// parseInt('09') => octal == 0
					if(hm[0][0] == '0')
						hm[0] = hm[0][1];
					if(hm[1][0] == '0')
						hm[1] = hm[1][1];

					return parseInt(hm[0]) * 60 + parseInt(hm[1]);
				});

				var slider = this.node.find('#slider');
				slider.slider('values', 0, value[0]);
				slider.slider('values', 1, value[1]);
			} else {
				value = jQuery.map(value.split(','), function(elt) {
					var minmax = elt.split('-');
					//return [[parseInt(minmax[0]), parseInt(minmax[minmax.length-1])]];
					if(minmax.length == 1)
						return parseInt(minmax[0]);

					var ret = [];
					for(var i = parseInt(minmax[0]); i <= parseInt(minmax[1]); i++)
						ret.push(i);
					return ret;
				});

				value = value.sort(function(a,b) { return a-b; });

				var elts = this.node.find('#'+item);
				elts = item=='monthdays'?elts.find('td'):elts.children();

				var i = 0;
				elts.each(function (idx, elt) {
					if(value[i] == idx+1)
						{ $(elt).addClass('ui-state-highlight'); i++; }
					else
						{ $(elt).removeClass('ui-state-highlight'); }
				})
			}

			this.onChange(item);
		},

		_l10n: {'en': {
			'title'    : 'Schedule',
			'all'      : 'All',
			'none'     : 'None',
			'months'   : 'Months',
			'monthdays': 'Days of month',
			'weekdays' : 'Days of week',
			'hours'    : 'Hours',

			'dAbbr': ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
			'mAbbr': ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
			
			'fullText': ['', 'to', '', 'to']
		}},

		_html: '\
			<div class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" style="width: 270px; position: absolute;">\
				<div class="ui-datetimepicker-header ui-widget-header ui-helper-clearfix ui-corner-all">\
					<div class="ui-datetime-title " style="text-align: center">\
						<span id="title">Set your schedule</span>\
					<span class="ui-icon ui-icon-circle-close" style="float:right"></span>\
					</div>\
				</div>\
					<div style="width: 600px" class="AnyTime-pkr">\
\
						<div style="width: 188px; height: 237px;" class="AnyTime-date">\
							<h6 class="AnyTime-lbl AnyTime-lbl-month" style="">Months</h6>\
							<ul id="months" class="AnyTime-mons"></ul>\
\
							<h6 id="md-title" class="AnyTime-lbl AnyTime-lbl-dom">Days of Month</h6>\
							<table cellspacing="0" cellpadding="0" border="0" class="AnyTime-dom-table">\
							<tbody id="monthdays" class="AnyTime-dom-body">\
								<tr class="AnyTime-wk AnyTime-wk1"></tr>\
								<tr class="AnyTime-wk AnyTime-wk2"></tr>\
								<tr class="AnyTime-wk AnyTime-wk3"></tr>\
								<tr class="AnyTime-wk AnyTime-wk4"></tr>\
								<tr class="AnyTime-wk AnyTime-wk5"></tr>\
							</tbody>\
							</table>\
\
							<h6 class="AnyTime-lbl AnyTime-lbl-month" style="">Days of week</h6>\
							<ul id="weekdays" class="AnyTime-mons">\
								<li class="AnyTime-btn AnyTime-mon-btn AnyTime-mon1-btn ui-state-default ui-state-highlight">Mon\
								</li>\
								<li class="AnyTime-btn AnyTime-mon-btn AnyTime-mon2-btn ui-state-default ui-state-highlight">Tue\
								</li>\
								<li class="AnyTime-btn AnyTime-mon-btn AnyTime-mon3-btn ui-state-default ui-state-highlight">Wed\
								</li>\
								<li class="AnyTime-btn AnyTime-mon-btn AnyTime-mon4-btn ui-state-default ui-state-highlight">Thu\
								</li>\
								<li class="AnyTime-btn AnyTime-mon-btn AnyTime-mon5-btn ui-state-default ui-state-highlight">Fri\
								</li>\
								<li class="AnyTime-btn AnyTime-mon-btn AnyTime-mon6-btn ui-state-default">Sat\
								</li>\
								<li class="AnyTime-btn AnyTime-mon-btn AnyTime-mon7-btn ui-state-default">Sun\
								</li>\
								<li class="AnyTime-btn AnyTime-mon-btn AnyTime-mon12-btn ui-state-default ui-state-disabled">\
								</li>\
								<li class="AnyTime-btn AnyTime-mon-btn AnyTime-mon12-btn ui-state-default ui-state-disabled">\
								</li>\
								<li class="AnyTime-btn AnyTime-mon-btn AnyTime-mon12-btn ui-state-default ui-state-disabled">\
								</li>\
								<li class="AnyTime-btn AnyTime-mon-btn AnyTime-mon12-btn ui-state-default ui-state-disabled">\
								</li>\
								<li id="weekdays-all" active="true" class="AnyTime-btn AnyTime-mon-btn AnyTime-mon12-btn ui-state-default ui-state-disabled">All\
								</li>\
							</ul>\
						</div>\
\
						<div style="width: 141px; height: 241px;" class="AnyTime-time">\
							<h6 class="AnyTime-lbl AnyTime-lbl-month" style="text-align: left">Hours</h6>\
							<div id="slider" class="ui-widget ui-widget-content ui-corner-all" style="height: 190px; top: 8px; left: 7px; border: 1px solid #aaa;">\
							</div>\
\
				</div>\
			</div>'

	});
})(jQuery);
