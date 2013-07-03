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
			    "afterClickSubmit": function () { return true; },
			    "afterClickCancel": function () { return true; },
			    
			    "afterDialogShow": function () { return true; },
			    "feedback": function (message) { console.log(message); return true; },

				
			    "afterObjectAdd": function () { return true; },
			    "afterObjectRemove": function () { return true; },
			    "afterObjectUpdate": function () { return true; },
			    
			    "beforeObjectAdd": function () { return true; },
			    "beforeObjectUpdate": function () { return true; },			    
			    "beforeObjectRemove": function () { return true; }
			}, options);            

			_parseLists($this, settings);
			
						
            $this.data("settings", settings);	
           // $this.data('test','test1');		

			$('body').on('click','a.jsfpSubmit', function(e){
				console.log('submitclick')
				var $link = $(e.target),
					isNew = $link.attr('data-isnew'),
					listName = $link.attr('data-list'),
					id= $link.attr('data-itemid');
					
				if(_submitForm($this,isNew,id,listName)){
					_closeDialog($this);
					_feedback($this,'Item submitted successfully');
					
				}
			
			})


			$('body').on('click','a.jsfpRemove', function(e){
				console.log('submitclick')
				var $link = $(e.target),					
					listName = $link.attr('data-list'),
					id= $link.attr('data-itemid');
					
				if(_removeItem($this,id,listName)){
					_closeDialog($this);
					_feedback($this,'Item removed successfully');
					
				}
			
			})

			
			$('body').on('click','a.jsfpCancel', function(){
				_closeDialog($this);			
			})

			$('body').on('click','a.jsfpEditItem', function(){
				var $button = $(this);				
				_closeDialog($this);
				$this.jfsp('showForm','edit',{id:$button.attr('data-itemid'),list:$button.attr('data-list')});
						
			})

			$('body').on('click','a.jsfpTemplateItem', function(){
				var $button = $(this);				
				_closeDialog($this);
				$this.jfsp('showForm','add',{id:$button.attr('data-itemid'),list:$button.attr('data-list')});						
			})
			
			
			
			
			
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

	function _closeDialog($this){
		var settings = $this.data('settings');
		if (typeof settings.closeDialog === "function") {
            if (!settings.closeDialog .call(this, $this)) {
                return false;
            }
        }
	
	}

	function _feedback($this,msg){
		var settings = $this.data('settings');
		if (typeof settings.feedback=== "function") {
            if (!settings.feedback.call(this, msg)) {
                return false;
            }
        }
	
	}



	function _getFormValue(id,$field){
		var type = $field.attr('data-type'),
			format = $field.attr('data-format'),
			value = '';
			
		switch(type){	
		
			case 'Boolean':
				value = $('input:radio[name='+id+']:checked').val();
				//console.log('Boolean',value);
				break;

			case 'Lookup':
			case 'Choice':			
								
				if(format == 'Dropdown'){
					value = $('#jfsp_'+id).val();	
				} else {
					value = $('input:radio[name='+id+']:checked').val();	
						
				}	
				break;			
			
			case 'Note':
				//todo: fix the breaky thing
				value = $field.find('textarea').val();
				value = _escapeHtml(value)		;
				//console.log(value);
				//value='test';
		
				break;
			case 'MultiChoice'://checkboxes				
			case 'LookupMulti': //checkboxes
				//console.log(type);
				value = [];
				$('input:checkbox[name='+id+']:checked').each(function(){
					var $cbox = $(this);	
						value.push($cbox.val());					
						value.push($cbox.attr('data-metavalue'));
				});
								
				value=value.join(";#"); 				

				break;
				
			case 'DateTime':
				value = $field.find('input').val();

				if(value != ''){
					value += ':00'
				}
				break;
	
			default:
				//console.log(type);
				value = $field.find('input').val();

		}		
		

		if(value != ''){		
			return [id,value];
		}
		return false;
	}


	function _getValuePairs($this){
		var aReturn = [];
		
		$('div.jsfpField').each(function(){
			var $field = $(this),
				pair = [],
				id = $field.attr('data-id');
				
				
			if( id !='ID' && id != 'Attachments' ){
				pair = _getFormValue(id,$field);				
				if(typeof(pair) != 'boolean'){					
					aReturn.push(pair);
				}
				//console.log('_getValuePairs',$(this).attr('data-id'));
			}
			
		});
		//console.log('aReturn',aReturn);
		return aReturn;
		
	}





  function _escapeHtml(string) {
    var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }



	function _removeItem($this,id,listName){
		var setting = $this.data('settings'),
			valuePairs = _getValuePairs($this),		
			bReturn = true;	
			console.log('removeItem');

			
		$().SPServices({
			operation: "UpdateListItems",					
			listName: listName,
			asynch: false,
			ID:id,
			batchCmd: "Delete",					
			completefunc: function (xData, Status) {										
				$(xData.responseXML).SPFilterNode("ErrorText").each(function() { 
	        		console.log(this);
	        		alert($(this).text());
	        		bReturn = false;
	        	});							
				return bReturn;
			}
		});

		
		return bReturn;
	}




	function _submitForm($this,isNew,id,listName){
		var setting = $this.data('settings'),
			valuePairs = _getValuePairs($this),		
			bReturn = true;	


		if(isNew == 'true'){
		console.log('spAdd');
			//valuePairs = [['Title','New 1']];
			//todo radio if empty undefined dont get value
			$().SPServices({
				operation: "UpdateListItems",					
				listName: listName,				
				batchCmd: "New",					
				valuepairs: valuePairs ,
				completefunc: function (xData, Status) {
					$(xData.responseXML).SPFilterNode("ErrorText").each(function() { 
		        		console.log(this);
		        		alert($(this).text());
		        		bReturn = false;
		        	});							
					return bReturn;
				}
			});
	
			

	
		} else {
			//console.log('UpdateListItems',id,listName);
			//console.log(valuePairs );
			console.log('spUpdate');

			//valuePairs = [['myCheckChoice','b;#b;#a;#a']];
			
			$().SPServices({
				operation: "UpdateListItems",					
				listName: listName,
				asynch: false,
				ID:id,
				batchCmd: "Update",					
				valuepairs: valuePairs ,
				completefunc: function (xData, Status) {										
					$(xData.responseXML).SPFilterNode("ErrorText").each(function() { 
		        		console.log(this);
		        		alert($(this).text());
		        		bReturn = false;
		        	});							
					return bReturn;
				}
			});
		}
		
		return bReturn;
	}



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
			case ('read'):
				sReturn = _getReadHTML($this,obj);
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

	function _getReadHTML($this,obj){
	console.log('getReadHTML');
		var sHtml = '',
			settings = $this.data('settings'),
			id = obj.id,	
			i=0,		
			list = settings.lists[obj.list],
			listName = obj.list,

			fields = list.fields,
			lenFields = fields.length,			
			item = _getListItem(id,list.listName),
			objAttr = item.attributes;	
			
		console.log(list, list.title );		
		
		sHtml += '<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
		sHtml +=  '<h3>'+ list.title + ' Item</h3>';		
	
		sHtml += '</div><div class="modal-body">';	
				
		for(var i = 0; i < lenFields ; i++) {
			sHtml += _getFieldReadHTML(fields[i],objAttr );			
		}	
			
		sHtml += '</div>';	

		sHtml +=  '<div class="modal-footer">';				
		sHtml +=  '<a href="javascript:void(0)" class="btn jsfpCancel"><i class="icon-remove-circle"></i> Cancel</a>';
		sHtml +=  '<a href="javascript:void(0)" data-itemid="'+id+'" data-list="'+listName +'" class="btn btn-inverse jsfpTemplateItem"><i class="icon-copy"></i> Use as template</a>';			

		sHtml +=  '<a href="javascript:void(0)" data-itemid="'+id+'" data-list="'+listName +'" class="btn btn-primary jsfpEditItem"><i class="icon-edit"></i> Edit</a></div>';			
		sHtml += '</div>';	


				
		return sHtml;
	}



	function _getFormHTML($this,obj,isNew){
		var sHtml = '',
			settings = $this.data('settings'),
			id = obj.id,	
			i=0,		
			list = settings.lists[obj.list],
			listName = obj.list,

			fields = list.fields,
			lenFields = fields.length,			
			item = _getListItem(id,list.listName),
			objAttr = item.attributes;	
			
		console.log(list, list.title );		
		
		sHtml += '<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';

		if(isNew){
			sHtml +=  '<h3>'+ list.title + ': New item </h3>';	
			objAttr.ID = ''; 
		} else {
			sHtml += '<h3>'+ list.title + ': Edit item </h3>';
		}
	
		sHtml += '</div><div class="modal-body">';	
				
		for(var i = 0; i < lenFields ; i++) {
			sHtml += _getFieldHTML(fields[i],objAttr );			
		}		
		sHtml += '</div>';	

		sHtml +=  '<div class="modal-footer">';	
		if(isNew){			
			sHtml +=  '<a href="javascript:void(0)" class="btn jsfpCancel"><i class="icon-remove-circle"></i> Cancel</a>';
			sHtml +=  '<a href="javascript:void(0)" data-isnew="true" data-itemid="" data-list="'+listName +'" class="btn btn-primary  jsfpSubmit"><i class="icon-ok-circle"></i> Submit</a> </div>';	
			
		} else {			
			sHtml +=  '<a href="javascript:void(0)" class="btn jsfpCancel"><i class="icon-remove-circle"></i> Cancel</a>';
			sHtml +=  '<a href="javascript:void(0)" data-isnew="false" data-itemid="'+id+'" data-list="'+listName +'" class="btn btn-primary jsfpSubmit"><i class="icon-ok-circle"></i> Update</a> </div>';	
			

		}
		sHtml += '</div>';	


				
		return sHtml;
	}


	function _getRemoveFormHTML($this,obj){
		
		var sHtml = '',
			settings = $this.data('settings'),
			id = obj.id,	
			i=0,		
			list = settings.lists[obj.list],
			listName = obj.list,

			fields = list.fields,
			lenFields = fields.length,			
			item = _getListItem(id,list.listName),
			objAttr = item.attributes;	
			
		console.log(list, list.title );		
		
		sHtml += '<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';

	
		sHtml +=  '<h3>'+ list.title + ': Remove item </h3>';	

	
		sHtml += '</div><div class="modal-body">';	
				
		for(var i = 0; i < lenFields ; i++) {
			sHtml += _getFieldReadHTML(fields[i],objAttr );			
		}		
		sHtml += '</div>';	

		sHtml +=  '<div class="modal-footer">';				
			sHtml +=  '<a href="javascript:void(0)" class="btn jsfpCancel"><i class="icon-remove-circle"></i> Cancel</a>';
			sHtml +=  '<a href="javascript:void(0)" data-isnew="false" data-itemid="'+id+'" data-list="'+listName +'" class="btn btn-warning jsfpRemove"><i class="icon-trash"></i> Remove</a> </div>';	
		sHtml += '</div>';	


				
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

	function _getFieldReadHTML(field,values){
		var sReturn = '',
			fieldAttr =  field.attributes,
			type = fieldAttr.Type,
			sRequired = '',
			aValues=[],
			format= _safeValue(fieldAttr.Format),
			value = _safeValue(values[fieldAttr.StaticName]);		

		if(fieldAttr.Required == 'TRUE'){
			sRequired =' <span>(Required)</span> '
		}

		
		switch(type){				
			
			case 'Boolean':
				break;
			
			case 'Choice':
				aValues = _formatOWSItem(value,0);
				sReturn += '<div><span class="jsfpReadLabel">'+fieldAttr.DisplayName+':</span> <b>'+type+'</b> <span class="jsfpReadTitle">'+aValues.join(',') +'</span></div>';	

				break;
			case 'Note':				
				sReturn += '<div><span class="jsfpReadLabel">'+fieldAttr.DisplayName+':</span> <b>'+type+'</b><span class="jsfpReadTitle"><pre>'+_escapeHtml(value) +'</pre></span></div>';	

				break;


			case 'Lookup':	
			case 'MultiChoice'://checkboxes				
			case 'LookupMulti': //checkboxes
				aValues = _formatOWSItem(value,1)

				sReturn += '<div><span class="jsfpReadLabel">'+fieldAttr.DisplayName+':</span> <span class="jsfpReadTitle">'+aValues.join(',') +'</span></div>';	
				break;	
			/*
			case 'Attachments':
				sReturn += 'TODO: '+type + ' ' + field.DisplayName + ' = ' + value + '<br />';
				break;
			*/		
			default:
				sReturn += '<div><span class="jsfpReadLabel">'+fieldAttr.DisplayName+':</span> <span class="jsfpReadTitle">'+value+'</span></div>';						
				break;
		}
		
		
		
		
		return sReturn;
	}


	function _getFieldHTML(field,values){
		var sReturn = '',
			fieldAttr =  field.attributes,
			type = fieldAttr.Type,
			sRequired = '',
			format= _safeValue(fieldAttr.Format),
			value = _safeValue(values[fieldAttr.StaticName]);		

		if(fieldAttr.Required == 'TRUE'){
			sRequired =' <span>(Required)</span> '
		}

		
		switch(type){		
			
			case 'Counter':
				sReturn += '<div class="jsfpField" data-type="'+type+'" data-id="'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" >';
				sReturn +=  '<div><label class="jfspFieldTitle" for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+ sRequired +'</label><input type="text" id="jfsp_'+fieldAttr.StaticName+'" data-Name="'+fieldAttr.StaticName+'" value="' + value + '" disabled=true /></div>  ';
				sReturn += '</div>';
				break;
				
			case 'URL':
			case 'Text':
				sReturn += '<div class="jsfpField" data-type="'+type+'" data-id="'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" >';
				sReturn +=  '<div><label class="jfspFieldTitle" for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+ sRequired +'</label><input type="text"  id="jfsp_'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" data-Name="'+fieldAttr.StaticName+'" value="' + value + '" /></div>  ';
				sReturn += '</div>';
				break;

			case 'DateTime':
				value = value.substring(0,16);
				sReturn += '<div class="jsfpField" data-type="'+type+'" data-id="'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" >';
				sReturn +=  '<div><label class="jfspFieldTitle" for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+ sRequired +'</label><input type="datetime" placeholder="dd/mm/yyyy hh:mm" id="jfsp_'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" data-Name="'+fieldAttr.StaticName+'" value="' + value + '" /></div>  ';
				sReturn += '</div>';
				break;
			

			case 'Note':
				sReturn += '<div class="jsfpField" data-type="'+type+'" data-id="'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" >';
				sReturn +=  '<div><label class="jfspFieldTitle" for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+ sRequired +'</label><textarea type="datetime" id="jfsp_'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" data-Name="'+fieldAttr.StaticName+'" >' + value + '</textarea></div>  ';
				sReturn += '</div>';
				break;
				


			case 'Lookup':
				if(fieldAttr.lookupLen > 5){
					format = 'Dropdown';
				} else {
					format = 'Radio';
				}

			case 'Choice':				
				sReturn += '<div class="jsfpField" data-type="'+type+'" data-format="'+format+'" data-id="'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" >';
				if(format == 'Dropdown'){
					sReturn += '<div class="jfspSelect">'+_getSelectHTML(field,values,fieldAttr,type,value,sRequired )+'</div>';
				} else {
					sReturn += '<div class="jfspRadio">'+ _getRadioHTML(field,values,fieldAttr,type,value,sRequired )+'</div>';
				}
				sReturn += '</div>';
				break;



		
			case 'Currency':
				// no break under here so it also runs over the number code block...

			case 'Number':
				sReturn += '<div class="jsfpField" data-type="'+type+'" data-id="'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" >';
				sReturn +=  '<div><label class="jfspFieldTitle" for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+ sRequired +'</label><input type="Number" id="jfsp_'+fieldAttr.StaticName+'"';				
				sReturn += ' min = "'+_safeValue(fieldAttr.Min)+'" ';				
				sReturn += ' max = "'+_safeValue(fieldAttr.Max)+'" ';
				sReturn += ' data-decimals = "'+_safeValue(fieldAttr.Decimals)+'" ';		
				
				sReturn += 'data-Required="'+fieldAttr.Required+'" data-Name="'+fieldAttr.StaticName+'" value="' + value + '" /></div>  ';
				sReturn += '</div>';
				break;
		
			
			
			case 'Boolean':
				sReturn += '<div class="jsfpField" data-type="'+type+'"  data-format="Radio" data-id="'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" >';
				sReturn += '<div class="jfspRadio"><label class="jfspFieldTitle">'+fieldAttr.DisplayName+ sRequired +'</label>';
				sReturn += '<input id="jfsp_'+fieldAttr.StaticName+'_1" type="radio" name="'+fieldAttr.StaticName+'" ';
				if( value == 1){
					sReturn += ' checked="checked" ';
				}
				sReturn += 'value="1"><label for="jfsp_'+fieldAttr.StaticName+'_1">Yes</label>';
				
				sReturn += '<input type="radio" name="'+fieldAttr.StaticName+'" id="jfsp_'+fieldAttr.StaticName+'_0" ';
				if( value == 0){
					sReturn += ' checked="checked" ';
				}
				
				sReturn += 'value="0"><label for="jfsp_'+fieldAttr.StaticName+'_0">No</label></div>';
				sReturn += '</div>';
				break;
			
			
			case 'MultiChoice'://checkboxes				
			case 'LookupMulti': //checkboxes
				sReturn += '<div class="jsfpField" data-type="'+type+'" data-id="'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" >';
				sReturn += '<div class="jfspCheckBox">'+_getcheckboxHTML(field,values,fieldAttr,type,value,sRequired )+'</div>';
				sReturn += '</div>';
				break;
			/*
			case 'Attachments':
				sReturn += 'TODO: '+type + ' ' + field.DisplayName + ' = ' + value + '<br />';
				break;
			*/		
			default:
				console.log('type' ,type)
				//sReturn += 'TODO: '+type + ' ' + field.DisplayName + ' = ' + value + '<br />';				
				break;
		}
		
		
		
		
		return sReturn;
	}


	function _getSelectHTML(field,values,fieldAttr,type,value,sRequired ){
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
			
			sReturn += '<label class="jfspFieldTitle" for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+ sRequired +'</label>';
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

	function _getRadioHTML(field,values,fieldAttr,type,value,sRequired ){
		//choice or lookup	
		
		var sReturn ='',
			numItems = 0,
			text = '',
			labelKey = '#text',
			valueKey='#text',
			aValues = _formatOWSItem(value,0),
			optLabel = '',
			optVal = '',
			items = [],
			i=0;			
			
			sReturn += '<label class="jfspFieldTitle" for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+ sRequired +'</label>';
			
			
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
				if( aValues[0] == optVal ){
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
			sReturn = '<label class="jfspFieldTitle" for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+'</label>';
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

				
				sReturn += '<input id="jfsp_'+fieldAttr.StaticName+'_'+i+'" type="checkbox" name="'+fieldAttr.StaticName+'" data-metavalue="'+ optLabel +'" ';				
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
