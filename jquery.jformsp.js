; (function ($) {
    "use strict";

    var methods = {
        init: function (options) {
			console.log('init');
            var $this = $(this),
			settings = $.extend({			   
				
			    "afterInit": function () { console.log('afterInit');return true; },
			    "afterListParse": function () { return true; },
			    "showDialog": function (innerHtml) { return true; },
			    "closeDialog": function (innerHtml) { return true; },



			    "onClickAdd": function () { return true; },
			    "onClickEdit": function () { return true; },
			    "onClickDelete": function () { return true; },
			    
			    "afterDialogShow": function () {console.log('afterDialogShow'); return true; },
				
			    "afterObjectAdd": function () { return true; },
			    "afterObjectRemove": function () { return true; },
			    "afterObjectUpdate": function () { return true; },
			    
			    "beforeObjectAdd": function () { return true; },
			    "beforeObjectUpdate": function () { return true; },			    
			    "beforeObjectRemove": function () { return true; }
			}, options);            

			_parseLists($this, settings);
			console.log(settings)
            $this.data("settings", settings);	
            $this.data('test','test1');		


			
            if (typeof settings.afterInit === "function") {
                if (!settings.afterInit.call(this, $this)) {
                    return false;
                }
            } 
        },
        	
		showForm: function(type,obj){
			console.log('showEditForm',obj);
			var $this = $(this),
				settings = $this.data("settings"),
				innerHTML = _getFormInnerHTML($this,type,obj);		
			
			/*
			
				Do Stuff Here
			
			*/
			if (typeof settings.showDialog=== "function") {
                if (!settings.showDialog.call(this, innerHTML )) {
                    return false;
                }
            }
			
			if (typeof settings.afterDialogShow === "function") {
                if (!settings.afterDialogShow.call(this, $this)) {
                    return false;
                }
            }
		}
		
		
        	
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



	function _getFormInnerHTML($this,type,obj){
		var sReturn = "";
		
		switch(type){
			case ('display'):
				sReturn = _getDisplayFormInnerHTML($this,obj);
				break;

			case ('add'):
				sReturn = _getAddFormInnerHTML($this,obj);
				break;
				
			case ('edit'):
				sReturn = _getEditFormInnerHTML($this,obj);
				break;
			
			case ('remove'):
				sReturn = _getRemoveFormInnerHTML($this,obj);
				break;
		
		}
		
		return sReturn;
	}



	function _getListItem(id, list){
		var oReturn = {}
		console.log('_getListItem',id,list);
		$().SPServices({
	        operation:	"GetListItems",
	        async:	false,
	        listName:	list,
	        CAMLQuery:	"<Query><Where><Eq><FieldRef Name='ID'/><Value Type='Counter'>"+id+"</Value></Eq></Where></Query>",
	        CAMLRowLimit: 10,
	        completefunc: function(xData,status){	        	
	        	$(xData.responseXML).SPFilterNode("z:row").each(function() { 
	        		oReturn = _xmlToJson(this)
	        	});	        	
	        }
	    })
	    console.log(oReturn )
		return oReturn;
	}

	/*
		obj.itemID
		obj.list
	*/
	function _getEditFormInnerHTML($this,obj){
		var sHtml = 'getEditFormInnerHTML',
			settings = $this.data('settings'),
			id = obj.id,			
			list = settings.lists[obj.list],
			item = 	_getListItem(id,list.listName);
		
			console.log('getEditFormInnerHTML',item,list)
		
		return sHtml;
	}

	function _getAddFormInnerHTML($this){
		var sHtml = 'getAddFormInnerHTML';
		
		return sHtml;
	}
	
	function _getDisplayFormInnerHTML($this){
		var sHtml = 'getDisplayFormInnerHTML';
		
		return sHtml;
	
	}

	function _getRemoveFormInnerHTML($this,obj){
		var sHtml = 'getRemoveFormInnerHTML';
		
		return sHtml;
	
	}


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
					obj["attributes"][attribute.nodeName.replace('ows_','')] = attribute.nodeValue;
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
