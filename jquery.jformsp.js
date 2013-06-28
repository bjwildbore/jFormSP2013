; (function ($) {
    "use strict";

    var methods = {
        init: function (options) {
			
            var $this = $(this),
			settings = $.extend({			   
				
			    "afterInit": function () { return true; },
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
			
            $this.data("settings", settings);	
            $this.data('test','test1');		


			
            if (typeof settings.afterInit === "function") {
                if (!settings.afterInit.call(this, $this)) {
                    return false;
                }
            } 
        },
        	
		showForm: function(type,obj){
			
			var $this = $(this),
				settings = $this.data("settings"),
				innerHTML = _getDialogHTML($this,type,obj);		
			
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

	function _parseLists($this,settings){
							
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
									field.lookupOptions = [];
									field.lookupLen = 0;			      					
			      					
			      					if (typeof($node.attr('List')) !== "undefined"){										
										field.lookupOptions = _getLookupOptions($node.attr('List'));
										field.lookupLen = field.lookupOptions.length;										
										
									}
									
									fields.push(field);				      					
			      					
			      				}     				
		
			     	    	});
			     	    	lists[listName].fields = fields ;
			  			}
					});
				}
	       }//for		
			
			return lists;
		}

	function _getLookupOptions(list){
		var aReturn = [];
		$().SPServices({
	        operation:	"GetListItems",
	        async:	false,
	        listName:	list, 
	        completefunc: function(xData,status){	        	
	        	$(xData.responseXML).SPFilterNode("z:row").each(function() { 
	        		aReturn.push(_xmlToJson(this).attributes);
	        	});	        	
	        }
		 })
		return aReturn
	}



	function _getDialogHTML($this,type,obj){
		var sReturn = "";
		
		switch(type){
			case ('display'):
				sReturn = _getDisplayHTML($this,obj);
				break;

			case ('add'):
				sReturn = _getFormHTML($this,obj,true);
				break;
				
			case ('edit'):
				sReturn = _getFormHTML($this,obj,false);
				break;
			
			case ('remove'):
				sReturn = _getRemoveFormHTML($this,obj);
				break;
		
		}
		
		return sReturn;
	}

	function _getDisplayFormHTML($this,obj){
		var sHtml = 'getDisplayFormHTML';
		
		return sHtml;
	
	}



	function _getFormHTML($this,obj,isNew){
		var sHtml = 'getFormHTML',
			settings = $this.data('settings'),
			id = obj.id,	
			i=0,		
			list = settings.lists[obj.list],
			fields = list.fields,
			lenFields = fields.length,			
			item = _getListItem(id,list.listName),
			objAttr = item.attributes;	
		
		for(var i = 0; i < lenFields ; i++) {
			sHtml += _getFieldHTML(fields[i],objAttr );			
		}		
					
		return sHtml;
	}


	function _getRemoveFormHTML($this,obj){
		var sHtml = 'getRemoveFormHTML';
		
		return sHtml;
	
	}


	
	


	
	

	function _getListItem(id, list){
		var oReturn = {id:'', attributes:{}}; //return empty if no id specified	
		
		if(id){		
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
	    }
	   
		return oReturn;
	}

	function _safeValue(value){
		if (typeof(value) == "undefined"){
			value = '';
		}
		
		return value;

	}



	function _getFieldHTML(field,values){
		var sReturn = '',
			fieldAttr =  field.attributes,
			type = fieldAttr.Type,
			format= _safeValue(fieldAttr.Format),
			value = _safeValue(values[fieldAttr.StaticName]);		

		

		sReturn += '<div class="jsfpField" data-type="'+type+'" data-id="'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" >';
		switch(type){
		
			
			case 'Counter':
				sReturn +=  '<div><label for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+'</label><input type="text" id="jfsp_'+fieldAttr.StaticName+'" data-Name="'+fieldAttr.StaticName+'" value="' + value + '" disabled=true /></div>  ';
				break;
			
			case 'Text':
				sReturn +=  '<div><label for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+'</label><input type="text"  id="jfsp_'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" data-Name="'+fieldAttr.StaticName+'" value="' + value + '" /></div>  ';
				break;

			case 'DateTime':
				sReturn +=  '<div><label for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+'</label><input type="datetime" placeholder="dd/mm/yyyy hh:mm am/pm" id="jfsp_'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" data-Name="'+fieldAttr.StaticName+'" value="' + value + '" /></div>  ';
				break;
			

			case 'Note':
				sReturn +=  '<div><label for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+'</label><textarea type="datetime" id="jfsp_'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" data-Name="'+fieldAttr.StaticName+'" >' + value + '</textarea></div>  ';
				break;
				


			case 'Lookup':
				if(fieldAttr.lookupLen > 5){
					format = 'Dropdown';
				} else {
					format = 'Radio';
				}

			case 'Choice':				
				if(format == 'Dropdown'){
					sReturn += _getSelectHTML(field,values,fieldAttr,type,value);
				} else {
					sReturn += _getRadioHTML(field,values,fieldAttr,type,value);
				}
				
				break;



		
			case 'Currency':
				// no break under here so it also runs over the number code block...

			case 'Number':
				
				sReturn +=  '<div><label for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+'</label><input type="Number" id="jfsp_'+fieldAttr.StaticName+'"';				
				sReturn += ' min = "'+_safeValue(fieldAttr.Min)+'" ';				
				sReturn += ' max = "'+_safeValue(fieldAttr.Max)+'" ';
				sReturn += ' data-decimals = "'+_safeValue(fieldAttr.Decimals)+'" ';		
				
				sReturn += 'data-Required="'+fieldAttr.Required+'" data-Name="'+fieldAttr.StaticName+'" value="' + value + '" /></div>  ';
				break;
		
			
			
			case 'Boolean':
				sReturn += '<div><label>'+fieldAttr.DisplayName+'</label> <input id="jfsp_'+fieldAttr.StaticName+'_1" type="radio" name="'+fieldAttr.StaticName+'" ';
				if( value == 1){
					sReturn += ' checked="checked" ';
				}
				sReturn += 'value="1"><label for="jfsp_'+fieldAttr.StaticName+'_1">Yes</label>';
				
				sReturn += '<input type="radio" name="jfsp_'+fieldAttr.StaticName+'_0" ';
				if( value == 0){
					sReturn += ' checked="checked" ';
				}
				
				sReturn += 'value="0"><label for="jfsp_'+fieldAttr.StaticName+'_0">No</label></div>';
			
				break;
			
			
			case 'MultiChoice'://checkboxes				
			case 'LookupMulti': //checkboxes
				sReturn += _getcheckboxHTML(field,values,fieldAttr,type,value);
				break;
			/*
			case 'Attachments':
				sReturn += 'TODO: '+type + ' ' + field.DisplayName + ' = ' + value + '<br />';
				break;
			*/		
			default:
				//sReturn += 'TODO: '+type + ' ' + field.DisplayName + ' = ' + value + '<br />';				
				break;
		}
		
		sReturn += '</div>';
		
		
		return sReturn;
	}


	function _getSelectHTML(field,values,fieldAttr,type,value){
		//choice or lookup

		var sReturn = '',
			numItems = 0,
			text = '',
			labelKey = '#text',
			valueKey='#text',
			optLabel = '',
			optVal = '',
			items = [],
			i=0;	
			
			sReturn += '<label for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+'</label>';
			sReturn += '<select id="jfsp_'+fieldAttr.StaticName+'" data-Name="'+fieldAttr.StaticName+'" required="'+fieldAttr.Required+'" >';	
			sReturn += '<option value="">Please select</option>';	


			if(type === 'Choice'){
				items = field.CHOICES.CHOICE;
				numItems = items.length;
				labelKey = '#text';
				valueKey = '#text';
			} else {
				items    = field.lookupOptions;
				numItems = field.lookupLen;
				labelKey = 'Title';
				valueKey = 'ID';		
			}	
			
			for(var i = 0; i < items.length; i++) {			
			
				optLabel = items[i][labelKey ];
				optVal = items[i][valueKey];
				
				sReturn += '<option value="'+optVal +'" ';
					if( value == optVal ){
						sReturn += ' selected ';
					}
					
   					sReturn += '>'+optLabel +'</option>';						

			}

		
			sReturn += '</select>';
			

			
		return sReturn;	
	}

	function _getRadioHTML(field,values,fieldAttr,type,value){
		//choice or lookup	
		
		var sReturn ='',
			numItems = 0,
			text = '',
			labelKey = '#text',
			valueKey='#text',
			optLabel = '',
			optVal = '',
			items = [],
			i=0;			
			
			sReturn += '<label for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+'</label>';
			
			
			if(type === 'Choice'){
				items = field.CHOICES.CHOICE;
				numItems = items.length;
				labelKey = '#text';
				valueKey = '#text';
			} else {
				items    = field.lookupOptions;
				numItems = field.lookupLen;
				labelKey = 'Title';
				valueKey = 'ID';		
			}	
						
			for(var i = 0; i < items.length; i++) {			
			
				optLabel = items[i][labelKey ];
				optVal = items[i][valueKey];

				
				sReturn += '<input id="jfsp_'+fieldAttr.StaticName+'_'+i+'" type="radio" name="'+fieldAttr.StaticName+'" ';
				if( value == optVal ){
					sReturn += ' checked="checked" ';
				}
				sReturn += 'value="'+optVal +'"><label for="jfsp_'+fieldAttr.StaticName+'_'+i+'">'+optLabel +'</label>';					

			}
				
		
			
		return sReturn;	
	}

	function _getcheckboxHTML(field,values,fieldAttr,type,value){
		// MultiChoice or LookupMulti
		var numItems = 0,
			text = '',
			labelKey = '#text',
			valueKey='#text',
			optLabel = '',
			optVal = '',
			items = [],
			i=0,			
			aValues = _formatOWSItem(value,0),
			sReturn = '<label for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+'</label>';
			if(type === 'MultiChoice'){
				items = field.CHOICES.CHOICE;
				numItems = items.length;
				labelKey = '#text';
				valueKey = '#text';
			} else {
				items    = field.lookupOptions;
				numItems = field.lookupLen;
				labelKey = 'Title';
				valueKey = 'ID';		
			}	
			
			for(i = 0; i < items.length; i++) {				
				optLabel = items[i][labelKey ];
				optVal = items[i][valueKey];

				
				sReturn += '<input id="jfsp_'+fieldAttr.StaticName+'_'+i+'" type="checkbox" name="'+fieldAttr.StaticName+'" ';				
				if( $.inArray(optVal , aValues )!== -1 ){				
					sReturn += ' checked="checked" ';
				}
				sReturn += 'value="'+optVal +'"><label for="jfsp_'+fieldAttr.StaticName+'_'+i+'">'+optLabel +'</label>';					

			}		
		
			
		return sReturn;	
	
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

	function _formatOWSItem(item,idx){
		var aTmp = [],
			bFirst = true,
			aValues = [],
			noId = false;
		
		if(item.charAt(0) == ';') {
			noId = true;
		}
		
		aValues[0] = [];
		aValues[1] = [];	
	
		if(item === null || item === undefined ){
			return "";		        
		} else {
			aTmp = item.split(';#');			
			
			if(noId){
				for(var i = 0; i < aTmp.length; i=i+1) {			
					if(aTmp[i].length){
						aValues[0].push(aTmp[i]);
					}
				}
			} else {
				for(var i = 0; i < aTmp.length; i=i+2) {			
					aValues[0].push(aTmp[i]);
					aValues[1].push(aTmp[i+1]);
				}
			
			}		
			
			return aValues[idx];
		}
	}


})(jQuery);
