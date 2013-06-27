; (function ($) {
    "use strict";

    var methods = {
        init: function (options) {
			console.log('init');
            var $this = $(this),
			settings = $.extend({			   
				
			    "afterInit": function () { return true; },
			    "afterListParse": function () { return true; },
/*
			    "onClickAdd": function () { return true; },
			    "onClickEdit": function () { return true; },
			    "onClickDelete": function () { return true; },
			    
			    "afterDialogShow": function () { return true; },
				
			    "afterObjectAdd": function () { return true; },
			    "afterObjectRemove": function () { return true; },
			    "afterObjectUpdate": function () { return true; },
			    
			    "beforeObjectAdd": function () { return true; },
			    "beforeObjectUpdate": function () { return true; },			    
			    "beforeObjectRemove": function () { return true; }
*/				
			}, options);            

			_parseLists($this, settings);
			console.log(settings)
            $this.data("settings", settings);			
			
            if (typeof settings.afterInit === "function") {
                if (!settings.afterInit.call(this, $this)) {
                    return false;
                }
            } 
        },	
    };
	
    $.fn.jfsp = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist in jfsp");
        }
        return this;
    };

    /* Private functions */

	function _parseLists($this,settings){
		console.log('_parseLists',settings);
			
		var sReturn = '',
			listName = '',			
			lists = settings.lists,
			i=0,
			len = lists.length;		
		
		for (var listName in lists) {
  			if (lists.hasOwnProperty(listName )) {	
		
				lists[listName].fields = [];
				
				$().SPServices({
		  			operation: "GetList",
		  			listName: listName ,
		  			completefunc: function(xData, Status) {
		    			var fields = [];
		    			$(xData.responseXML).find("Fields > Field[Hidden!='TRUE']").each(function() {
		      				var $node = $(this),
		      					children = {},
		      					choice = {},
		      					value='',
		      					field = {};
		      				
		      				if( typeof($node.attr('FromBaseType')) === 'undefined' 
		      					|| $node.attr('Name') == 'ID' 
		      					|| $node.attr('Name') == 'Title'
		      					|| $node.attr('Name') == 'Attachments'){ 
		      					
		      					field =_xmlToJson(this);	      					
		      					
	      						field.Name = $node.attr('Name');
	      						field.DisplayName = $node.attr('DisplayName');
								field.Type = $node.attr('Type');															
								field.Required = $node.attr('Required');
		      					fields.push(field);	
		      					
		      					//console.log(field.Name,field);
	      					
		      				}     				
	
		     	    	});
		     	    	lists[listName].fields = fields ;
		  			}
				});
			}
       }//for		
		
		return lists;
	}
	
	
	function _xmlToJson(xml) {
		
		// Create the return object
		var obj = {};
	
		if (xml.nodeType == 1) { // element
			// do attributes
			if (xml.attributes.length > 0) {
			obj["attributes"] = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj["attributes"][attribute.nodeName] = attribute.nodeValue;
				}
			}
		} else if (xml.nodeType == 3) { // text
			obj = xml.nodeValue;
		}
	
		// do children
		if (xml.hasChildNodes()) {
			for(var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				var nodeName = item.nodeName;
				if (typeof(obj[nodeName]) == "undefined") {
					obj[nodeName] = _xmlToJson(item);
				} else {
					if (typeof(obj[nodeName].push) == "undefined") {
						var old = obj[nodeName];
						obj[nodeName] = [];
						obj[nodeName].push(old);
					}
					obj[nodeName].push(_xmlToJson(item));
				}
			}
		}
		return obj;
	};


})(jQuery);
