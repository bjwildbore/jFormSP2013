;(function ($){
	jQuery.event.props.push("dataTransfer");

	//TODO: Listing Items
	//TODO: Tidy up callback functions
	//TODO: remove modal dependencies... or include in library

		var methods = {
		init: function (options) {

			var $this = $(this),
				settings = $.extend({
					"readIgnoreFields":'',
					"listIgnoreFields":'',
					"updateIgnoreFields":'',
					"afterInit": function () { return true; },
					"afterListParse": function () { return true; },
					"showDialog": function (innerHtml) { return true; },
					"closeDialog": function (innerHtml) { return true; },
					
					"afterItemUpdate": function ($this,id,listName) { 
						if($('table.'+listName).length > 0){
							$this.jfsp('refreshList',listName);
						}
						return true; 
					},
					"afterItemCreate": function ($this,id,listName) { 
						if($('table.'+listName).length > 0){
							$this.jfsp('refreshList',listName);
						}
						return true; 
					},
					
					"afterItemDelete": function ($this,$id,listName) { 
						if($('table.'+listName).length > 0){
							$this.jfsp('refreshList',listName);
						}
						return true; 
					},

					"afterDialogShow": function () { return true; },
					"feedback": function (message) { alert(message); return true; },
					"displayList": function ($this,listName,listItems) { 
						_defaultDisplayList($this,listName,listItems);
					}						
				}, options);

			_parseLists($this, settings);

			$this.data("settings", settings);

			$('body').on('click','a.jsfpSubmit', function(e){

				var $link = $(e.target),
					isNew = ($link.attr('data-isnew') == 'true')?true:false,
					listName = $link.attr('data-list'),
					id= $link.attr('data-itemid'),
					validationResult = _validateInput();

				if(validationResult.isValid	){
					if(_submitForm($this,isNew,id,listName,validationResult.valuePairs )){
						_closeDialog($this);
						if(isNew){
							if (typeof settings.afterItemCreate=== "function") {
								if (!settings.afterItemCreate.call(this, $this,id,listName)) {
									return false;
								}
							}
						}else {
							if (typeof settings.afterItemUpdate=== "function") {
								if (!settings.afterItemUpdate.call(this, $this,id,listName)) {
									return false;
								}
							}
						}
						_feedback($this,'Item submitted successfully');

					}
				} else {
					alert(validationResult.message);
				}
			});

			$('body').on('click','a.jsfpDelete', function(e){
				var $link = $(e.target),
					listName = $link.attr('data-list'),
					id= $link.attr('data-itemid');

				if(_deleteItem($this,id,listName)){
					_closeDialog($this);
					if (typeof settings.afterItemDelete=== "function") {
						if (!settings.afterItemDelete.call(this, $this,id,listName)) {
							return false;
						}
					}
					
					_feedback($this,'Item deleted successfully');
					
				}
			});

			
			$('body').on('click','.jfspListReadItem', function(){
				var $button = $(this),
				id = $button.attr('data-itemid'),
				list = $button.attr('data-list');

				$this.jfsp('showForm','read',{id:id,list:list});
			});
		
			$('body').on('click','.jfspListCreateItem', function(){
				var $button = $(this),				
				list = $button.attr('data-list');

				$this.jfsp('showForm','create',{list:list});
			});
		
			
			$('body').on('click','.jfspListUpdateItem', function(){
				var $button = $(this),
				id = $button.attr('data-itemid'),
				list = $button.attr('data-list');

				$this.jfsp('showForm','update',{id:id,list:list});
			});
			
			$('body').on('click','.jfspListDeleteItem', function(){
				var $button = $(this),
				id = $button.attr('data-itemid'),
				list = $button.attr('data-list');

				$this.jfsp('showForm','delete',{id:id,list:list});
			});

			$('body').on('click','i.jfspIconAttachDelete', function(){
				var $icon = $(this);
				$icon.toggleClass('icon-remove-sign').toggleClass('icon-undo');
				$icon.siblings().toggleClass('strike');
			});

			$('body').on('click','i.jfspIconAttachCancel', function(){
				$(this).parent().remove();
			});

			$('body').on('click','a.jsfpCancel', function(){
				_closeDialog($this);
			});

			$('body').on('click','a.jsfpUpdateItem', function(){
				var $button = $(this);
				_closeDialog($this);
				$this.jfsp('showForm','update',{id:$button.attr('data-itemid'),list:$button.attr('data-list')});
			});

			$('body').on('click','a.jsfpTemplateItem', function(){
				var $button = $(this);
				_closeDialog($this);
				$this.jfsp('showForm','create',{id:$button.attr('data-itemid'),list:$button.attr('data-list')});
			});

			$('body').on('change','.jfspAttachButton', function(event){
				_handleFileChange($this,event.target.files);
				$('.jfspAttachButtonWrap').html('<input type="file" name="jfspAttachButton" class="jfspAttachButton" multiple="multiple">');
			});

			//Add the drag and drop functionality to the editor
			$('body')
				.on('drop','#jfspAttachmentDrop',	function (e) {
					e.stopPropagation();
					e.preventDefault();
					_handleFileChange($this,e.dataTransfer.files);
				})
				.on('dragenter dragover','#jfspAttachmentDrop', function (e) {
					e.stopPropagation();
					e.preventDefault();
				});

			//Prevent the default behaviour of the page drop
			$(document).on('drop dragover', function (e){
				e.preventDefault();
				return false;
			});

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
		},
		
		refreshList: function(listName){	
			var $this = $(this),
				settings = $this.data("settings"),
				list = settings.lists[listName],
				view = list.view ;
			
			_showList($this,listName,view.CAMLViewFields,view.CAMLQuery,view.CAMLRowLimit);
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

	function _showList($this,listName,CAMLViewFields,CAMLQuery,CAMLRowLimit){		
		var settings = $this.data("settings"),			
			CAMLViewFields = CAMLViewFields || '',
			CAMLQuery = CAMLQuery || '',			
			CAMLRowLimit = CAMLRowLimit|| ''
			listItems = [];										
			
		$().SPServices({
			operation: "GetListItems",
			async: false,				
			listName: listName,											    
			CAMLViewFields: CAMLViewFields,
			CAMLQuery: CAMLQuery,			
			CAMLRowLimit: CAMLRowLimit,	

			completefunc: function (xData, Status) {
				$(xData.responseXML).SPFilterNode("z:row").each(function() {
					listItems.push(_xmlToJson(this));
				});
				
				if (typeof settings.displayList === "function") {
					if (!settings.displayList.call(this, $this,listName, listItems)) {
						return false;
					}
				}					
			}
		});		
	}

	function _defaultDisplayList($this,listName,listItems){

		var sHtml = '',
			sTHead = '<thead>',
			sTBody = '<tbody>',
			settings = $this.data('settings'),			
			i=0,
			item = {},
			attributes = {},
			list = settings.lists[listName],			
			field = {},
			fields = list.fields,
			lenFields = fields.length,			
			objAttr = {};
			
		for( j = 0; j < listItems.length; j++) {
			itemAttributes = listItems[j].attributes;
			console.log(itemAttributes );
			sTBody +='<tr>';
			
			sTBody +='<td><div class="btn-group">';
			sTBody +='<div data-list="'+listName+'" data-itemid="'+itemAttributes.ID+'" class="btn jfspListReadItem"><i class="icon-file-text-alt"></i></div>';
			sTBody +='<div data-list="'+listName+'" data-itemid="'+itemAttributes.ID+'" class="btn jfspListUpdateItem"><i class="icon-edit"></i></div>';
			sTBody +='<div data-list="'+listName+'" data-itemid="'+itemAttributes.ID+'" class="btn jfspListDeleteItem"><i class="icon-remove"></i></div>';			
			sTBody +='</div></td>';
			
			if(j==0){
				sTHead +='<tr><th><div id="createButton" data-list="'+listName+'"  class="btn btn-primary jfspListCreateItem"><i class="icon-plus"></i> New </div></th>';
			}
			for( i = 0; i < lenFields ; i++) {
				field = fields[i];
				if ((list.listIgnoreFields.length > 1 && $.inArray(field.attributes.StaticName, list.listIgnoreFields) <= -1) ||	field.attributes.Required == 'TRUE'		) {
					sTBody += '<td>'+ _getFieldReadHTML(field,itemAttributes,true) + '</td>';
					if(j==0){
						sTHead +='<th>'+ field.attributes.DisplayName +'</th>';
					}
				}
			}
			
			if(j==0){
				sTHead +='<tr>';
			}
			
			sTBody +='</tr>';
			

		}

		sTHead += '</thead>';
		sTBody += '</tbody>';

		sHtml = '<table class="jfspList table table-hover table-condensed '+ listName+'">' + sTHead + sTBody + '</table>';
		$('table.'+listName).remove();
		$this.html(sHtml);

	}

	function _validateInput(){
		var oValidationResults = {valuePairs:[],isValid:true,message:''};

		$('div.jsfpField').each(function(){
			var $field = $(this),
				oPair = {},
				id = $field.attr('data-id');

			if( id !='ID' && id != 'Attachments' ){
				oPair = _getFormValue(id,$field);

				if(oPair.isValid){
					oValidationResults.valuePairs.push(oPair.pair);
				} else {
					oValidationResults.message += oPair.message;
					oValidationResults.isValid = false;
				}
			}
		});
		return oValidationResults ;
	}

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
			max = _safeValue($field.find('input').attr('max')),
			min = _safeValue($field.find('input').attr('min')),
			isRequired = ($field.attr('data-required')=='TRUE')?true:false,
			oPair = {pair:[],isValid:true,message:''},
			value = '';

		switch(type){
			case 'Boolean':
				value = $('input:radio[name='+id+']:checked').val();
				oPair.pair = [id,_safeValue(value)];
				break;

			case 'Lookup':
			case 'Choice':
				if(format == 'Dropdown'){
					value = $('#jfsp_'+id).val();
				} else {
					value = $('input:radio[name='+id+']:checked').val();

				}
				oPair.pair = [id,_safeValue(value)];
				break;

			case 'Note':
				//todo: fix the breaky thing
				value = $field.find('textarea').val();
				value = _escapeHtml(value);
				oPair.pair = [id,_safeValue(value)];
				break;
				
			case 'MultiChoice'://checkboxes
			case 'LookupMulti': //checkboxes
				value = [];
				$('input:checkbox[name='+id+']:checked').each(function(){
					var $cbox = $(this);
						value.push($cbox.val());
						value.push($cbox.attr('data-metavalue'));
				});

				value=value.join(";#");
				oPair.pair = [id,_safeValue(value)];
				break;

			case 'DateTime':
				value = $field.find('input').val();
				
				if(value !== ''){
					value += ':00';
				}

				oPair.pair = [id,_safeValue(value)];
				break;

			case 'Currency':
			case 'Number':
				value = _safeValue($field.find('input').val());
				oPair.pair = [id,value];

				if(value !== ''){
					value = Number(value);
					if(!$.isNumeric(value )){

						oPair.isValid = false;
						oPair.message += id + ' must be numeric field\n';
					}

					if(max !== '' && Number(max)< value ){
						oPair.isValid = false;
						oPair.message += id + ' must be less than '+ max +'\n';
					} else if (min !== '' && Number(min)> value ) {
						oPair.isValid = false;
						oPair.message += id + ' must be greater than '+ min +'\n';
					}
				}
				break;

			default:
				value = $field.find('input').val();
				oPair.pair = [id,_safeValue(value)];
		}

		if( isRequired && oPair.pair[1] === ''){
			oPair.isValid = false;
			oPair.message += id + ' is a required field\n';
		}
		return oPair;
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

	function _deleteItem($this,id,listName){
		var bReturn = true;		

		$().SPServices({
			operation: "UpdateListItems",
			listName: listName,
			asynch: false,
			ID:id,
			batchCmd: "Delete",
			completefunc: function (xData, Status) {
				$(xData.responseXML).SPFilterNode("ErrorText").each(function(){
					alert($(this).text());
					bReturn = false;
				});
				return bReturn;
			}
		});
		
		return bReturn;
	}
	
	function _submitForm($this,isNew,id,listName,valuePairs ){
		var settings = $this.data('settings'),
			list = settings.lists[listName],
			bReturn = true;

		if(isNew === true){
			$().SPServices({
				operation: "UpdateListItems",
				listName: listName,
				batchCmd: "New",
				valuepairs: valuePairs ,
				completefunc: function (xData, Status){
					$(xData.responseXML).SPFilterNode("ErrorText").each(function(){
						alert($(this).text());
						bReturn = false;
					});
				}
			});

		} else {
			$().SPServices({
				operation: "UpdateListItems",
				listName: listName,
				asynch: false,
				ID:id,
				batchCmd: "Update",
				valuepairs: valuePairs ,
				completefunc: function (xData, Status) {
					$(xData.responseXML).SPFilterNode("ErrorText").each(function(){
						alert($(this).text());
						bReturn = false;
					});
				}
			});
			
			if(list.allowAttachments === true){
				_deleteUnwantedAttachments($this,id,listName);
			}
		}
		
		/* handle attachments */
		if(list.allowAttachments === true){
			_createNewAttachments($this,id,listName);
		}
		return bReturn;
	}



	function _parseLists($this,settings){
		var listName = '',
			lists = settings.lists;

		for (listName in lists) {
			if (lists.hasOwnProperty(listName )) {
				lists[listName].fields = [];
				
				if(!lists[listName].hasOwnProperty('view')){
					lists[listName].view= {					
						CAMLViewFields: '',
						CAMLQuery: '',				
						CAMLRowLimit: ''
					}				
				}
				

				if (lists[listName].readIgnoreFields.length) {
						lists[listName].readIgnoreFields= lists[listName].readIgnoreFields.split(",");
				}
				if (lists[listName].listIgnoreFields.length) {
						lists[listName].listIgnoreFields = lists[listName].listIgnoreFields .split(",");
				}

				if (lists[listName].updateIgnoreFields.length) {
						lists[listName].updateIgnoreFields = lists[listName].updateIgnoreFields .split(",");
				}


				$().SPServices({
					operation: "GetList",
					listName: listName ,
					completefunc: function(xData, Status) {
						var fields = [];
						$(xData.responseXML).find("Fields > Field[Hidden!='TRUE']").each(function(){
							var $node = $(this),
								field = {};

							if( typeof($node.attr('FromBaseType')) === 'undefined' || $node.attr('Name') == 'ID' || $node.attr('Name') == 'Title' || $node.attr('Name') == 'Attachments'){
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
				$(xData.responseXML).SPFilterNode("z:row").each(function(){
					aReturn.push(_xmlToJson(this).attributes);
				});
			}
		});
		return aReturn;
	}

	
	function _getDialogHTML($this,type,obj){
		var sReturn = "";

		switch(type){
			case ('read'):
				sReturn = _getReadHTML($this,obj);
				break;

			case ('create'):
				sReturn = _getFormHTML($this,obj,true);
				break;

			case ('update'):
				sReturn = _getFormHTML($this,obj,false);
				break;

			case ('delete'):
				sReturn = _getDeleteFormHTML($this,obj);
				break;
		}
		return sReturn;
	}

	function _getReadHTML($this,obj){
			var sHtml = '',
			settings = $this.data('settings'),
			id = obj.id,
			i=0,
			list = settings.lists[obj.list],
			listName = obj.list,
			field = {},
			fields = list.fields,
			lenFields = fields.length,
			item = _getListItem(id,list.listName),
			objAttr = item.attributes;

		sHtml += '<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
		sHtml += '<h3>'+ list.title + ' Item</h3></div><div class="modal-body">';

		for( i = 0; i < lenFields ; i++) {
			field = fields[i];
			if ((list.readIgnoreFields.length > 1 && $.inArray(field.attributes.StaticName, list.readIgnoreFields) <= -1) ||	field.attributes.Required == 'TRUE'		) {
				sHtml += _getFieldReadHTML(field,objAttr,false );
			}
		}

		if(list.allowAttachments === true){
			sHtml += _getReadAttachments(listName ,id);
		}

		sHtml += '</div><div class="modal-footer">';
		sHtml += '<a href="javascript:void(0)" class="btn jsfpCancel"><i class="icon-undo"></i> Cancel</a>';
		sHtml += '<a href="javascript:void(0)" data-itemid="'+id+'" data-list="'+listName +'" class="btn btn-inverse jsfpTemplateItem"><i class="icon-copy"></i> Use as template</a>';
		sHtml += '<a href="javascript:void(0)" data-itemid="'+id+'" data-list="'+listName +'" class="btn btn-primary jsfpUpdateItem"><i class="icon-edit"></i> Update</a></div>';
		sHtml += '</div>';

		return sHtml;
	}

	function _getFormHTML($this,obj,isNew){
		var sHtml = '<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
			settings = $this.data('settings'),
			id = obj.id,
			i=0,
			list = settings.lists[obj.list],
			listName = obj.list,
			field = {},
			fields = list.fields,
			lenFields = fields.length,
			item = _getListItem(id,list.listName),
			objAttr = item.attributes;

		if(isNew){
			sHtml +=	'<h3>'+ list.title + ': New item </h3>';
			objAttr.ID = '';
		} else {
			sHtml += '<h3>'+ list.title + ': Update item </h3>';
		}

		sHtml += '</div><div class="modal-body">';

		for(i = 0; i < lenFields ; i++) {
			field = fields[i];
			if ((list.updateIgnoreFields.length > 1 && $.inArray(field.attributes.StaticName, list.updateIgnoreFields) <= -1) || field.attributes.Required == 'TRUE') {
				sHtml += _getFieldHTML(field,objAttr );
			}
		}

		if(list.allowAttachments === true){
			sHtml += '<div><span class="jsfpReadLabel">Attachments:</span></div>';

			sHtml += '<div id="jfspAttachmentDrop"><span class="dragText"> <i class="icon-circle-arrow-down"></i> Drag and drop files here </span><ul class="jfspAttachments">';
			if(!isNew){
				sHtml += _getFormAttachments(listName ,id);
			}
			sHtml += '</ul><div class="jfspAttachButtonWrap"><input type="file" name="jfspAttachButton" class="jfspAttachButton" multiple="multiple"></div></div>';
		}

		sHtml += '</div><div class="modal-footer">';
		if(isNew){
			sHtml +=	'<a href="javascript:void(0)" class="btn jsfpCancel"><i class="icon-undo"></i> Cancel</a>';
			sHtml +=	'<a href="javascript:void(0)" data-isnew="true" data-itemid="" data-list="'+listName +'" class="btn btn-primary	jsfpSubmit"><i class="icon-save"></i> Submit</a> </div>';
		} else {
			sHtml +=	'<a href="javascript:void(0)" class="btn jsfpCancel"><i class="icon-undo"></i> Cancel</a>';
			sHtml +=	'<a href="javascript:void(0)" data-isnew="false" data-itemid="'+id+'" data-list="'+listName +'" class="btn btn-primary jsfpSubmit"><i class="icon-save"></i> Submit</a> </div>';
		}
		sHtml += '</div>';

		return sHtml;
	}

	function _getDeleteFormHTML($this,obj){
		var sHtml = '',
			settings = $this.data('settings'),
			id = obj.id,
			i=0,
			list = settings.lists[obj.list],
			listName = obj.list,
			fields = list.fields,
			field = {},
			lenFields = fields.length,
			item = _getListItem(id,list.listName),
			objAttr = item.attributes;

		sHtml += '<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
		sHtml += '<h3>'+ list.title + ': Delete item </h3></div><div class="modal-body">';

		for( i = 0; i < lenFields ; i++) {
			field = fields[i];
			if (		(list.readIgnoreFields.length > 1 && $.inArray(field.attributes.StaticName, list.readIgnoreFields) <= -1) ||	field.attributes.Required != 'TRUE'		) {
				sHtml += _getFieldReadHTML(field,objAttr,false );
				}
		}
		sHtml += '</div><div class="modal-footer">';
		sHtml +=	'<a href="javascript:void(0)" class="btn jsfpCancel"><i class="icon-undo"></i> Cancel</a>';
		sHtml +=	'<a href="javascript:void(0)" data-isnew="false" data-itemid="'+id+'" data-list="'+listName +'" class="btn btn-warning jsfpDelete"><i class="icon-trash"></i> Delete</a> </div>';
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
					$(xData.responseXML).SPFilterNode("z:row").each(function(){
						oReturn = _xmlToJson(this);
					});
				}
			});
		}
		return oReturn;
	}

	
	function _getFieldReadHTML(field,values,forList){
		var sReturn = '',
			fieldAttr =	field.attributes,
			type = fieldAttr.Type,			
			aValues=[],
			forList = forList || false;
			value = _safeValue(values[fieldAttr.StaticName]);

		switch(type){
			case 'Choice':
				aValues = _formatOWSItem(value,0);
				if(forList ){
					sReturn += aValues.join(',');
				} else {
					sReturn += '<div><span class="jsfpReadLabel">'+fieldAttr.DisplayName+':</span> <span class="jsfpReadValue">'+aValues.join(',') +'</span></div>';
				}
				break;
				
			case 'Note':
				if(forList ){
					sReturn += '';
				} else {
					sReturn += '<div><span class="jsfpReadLabel">'+fieldAttr.DisplayName+':</span> <span class="jsfpReadValue"><pre>'+_escapeHtml(value) +'</pre></span></div>';
				}
				break;

			case 'Lookup':
			case 'MultiChoice'://checkboxes
			case 'LookupMulti': //checkboxes
				aValues = _formatOWSItem(value,1);
				if(forList ){
					sReturn += aValues.join(',');
				} else {
					sReturn += '<div><span class="jsfpReadLabel">'+fieldAttr.DisplayName+':</span> <span class="jsfpReadValue">'+aValues.join(',') +'</span></div>';
				}
				break;

			case 'Boolean':
				value = (value == 1)?'yes':'no';
				if(forList ){
					sReturn += value;
				} else {
					sReturn += '<div><span class="jsfpReadLabel">'+fieldAttr.DisplayName+':</span> <span class="jsfpReadValue">'+value+'</span></div>';
				}
				break;
			
			case 'Currency':
				value = parseFloat(this.value).toFixed(2);	
				
				if (value == 'NaN'){
					value = '';
				}
				
				if(forList ){
					sReturn += value;
				} else {
					sReturn += '<div><span class="jsfpReadLabel">'+fieldAttr.DisplayName+':</span> <span class="jsfpReadValue">'+value+'</span></div>';
				}
				break;
				

			case 'Number':
				
				if(_safeValue(fieldAttr.Decimals) !== ''){
					value = parseFloat(this.value).toFixed(fieldAttr.Decimals);	
				}
				
				if (value == 'NaN'){
					value = '';
				}

				
				if(forList ){
					sReturn += value;
				} else {
					sReturn += '<div><span class="jsfpReadLabel">'+fieldAttr.DisplayName+':</span> <span class="jsfpReadValue">'+value+'</span></div>';
				}
				break;


			default:
				if(forList ){
					sReturn += value;
				} else {
					sReturn += '<div><span class="jsfpReadLabel">'+fieldAttr.DisplayName+':</span> <span class="jsfpReadValue">'+value+'</span></div>';
				}
				break;
		}
		return sReturn;
	}

	function _getFieldHTML(field,values){
		var sReturn = '',
			fieldAttr =	field.attributes,
			type = fieldAttr.Type,
			sRequired = '',
			format= _safeValue(fieldAttr.Format),
			value = _safeValue(values[fieldAttr.StaticName]);

		if(fieldAttr.Required == 'TRUE'){
			sRequired =' <span>(Required)</span> ';
		}

		switch(type){
			case 'Counter':
				sReturn += '<div class="jsfpField" data-type="'+type+'" data-id="'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" >';
				sReturn +=	'<div><label class="jfspFieldTitle" for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+ sRequired +'</label>';
				sReturn +=	'<input type="text" id="jfsp_'+fieldAttr.StaticName+'" data-Name="'+fieldAttr.StaticName+'" value="' + value + '" disabled=true /></div>	';
				sReturn += '</div>';
				break;

			case 'Text':
				sReturn += '<div class="jsfpField" data-type="'+type+'" data-id="'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" >';
				sReturn += '<div><label class="jfspFieldTitle" for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+ sRequired +'</label>';
				sReturn +=	'<input type="text"	id="jfsp_'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" data-Name="'+fieldAttr.StaticName+'" value="' + value + '" /></div>	';
				sReturn += '</div>';
				break;

			case 'URL':
				sReturn += '<div class="jsfpField" data-type="'+type+'" data-id="'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" >';
				sReturn += '<div><label class="jfspFieldTitle" for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+ sRequired +'</label>';
				sReturn += '<span class="jfspHint">Format: <i>http://google.com, google</i></span>';
				sReturn +=	'<input type="text"	id="jfsp_'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" data-Name="'+fieldAttr.StaticName+'" value="' + value + '" /></div>	';
				sReturn += '</div>';
				break;

			case 'DateTime':
				value = value.substring(0,16);
				sReturn += '<div class="jsfpField" data-type="'+type+'" data-id="'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" >';
				sReturn +=	'<div><label class="jfspFieldTitle" for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+ sRequired +'</label>';
				sReturn += '<span class="jfspHint">Format: <i>2003-12-25 17:30</i></span>';
				sReturn +=	'<input type="datetime" placeholder="dd/mm/yyyy hh:mm" id="jfsp_'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" data-Name="'+fieldAttr.StaticName+'" value="' + value + '" /></div>	';
				sReturn += '</div>';
				break;

			case 'Note':
				sReturn += '<div class="jsfpField" data-type="'+type+'" data-id="'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" >';
				sReturn +=	'<div><label class="jfspFieldTitle" for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+ sRequired +'</label>';
				sReturn +=	'<textarea type="datetime" id="jfsp_'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" data-Name="'+fieldAttr.StaticName+'" >' + value + '</textarea></div>	';
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
				sReturn += '<div><label class="jfspFieldTitle" for="jfsp_'+fieldAttr.StaticName+'">'+fieldAttr.DisplayName+ sRequired +'</label>';
				sReturn += '<input type="Number" id="jfsp_'+fieldAttr.StaticName+'"';
				sReturn += ' min = "'+_safeValue(fieldAttr.Min)+'" ';
				sReturn += ' max = "'+_safeValue(fieldAttr.Max)+'" ';
				sReturn += ' data-decimals = "'+_safeValue(fieldAttr.Decimals)+'" ';
				sReturn += 'data-Required="'+fieldAttr.Required+'" data-Name="'+fieldAttr.StaticName+'" value="' + value + '" /></div>	';
				sReturn += '</div>';
				break;

			case 'Boolean':
				sReturn += '<div class="jsfpField" data-type="'+type+'"	data-format="Radio" data-id="'+fieldAttr.StaticName+'" data-Required="'+fieldAttr.Required+'" >';
				sReturn += '<div class="jfspRadio"><label class="jfspFieldTitle">'+fieldAttr.DisplayName+ sRequired +'</label>';
				sReturn += '<input id="jfsp_'+fieldAttr.StaticName+'_1" type="radio" name="'+fieldAttr.StaticName+'" ';
				if( value == 1){
					sReturn += ' checked="checked" ';
				}
				sReturn += 'value="1"><label for="jfsp_'+fieldAttr.StaticName+'_1">Yes</label>';

				sReturn += '<input type="radio" name="'+fieldAttr.StaticName+'" id="jfsp_'+fieldAttr.StaticName+'_0" ';
				if( value === 0){
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

			default:
				break;
		}
		return sReturn;
	}

	function _getSelectHTML(field,values,fieldAttr,type,value,sRequired ){
		var sReturn = '',
			numItems = 0,
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
			items		= field.lookupOptions;
			numItems = field.lookupLen;
			labelKey = 'Title';
			valueKey = 'ID';
		}

		for(i = 0; i < items.length; i++) {

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
		var sReturn ='',
			numItems = 0,
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
				items		= field.lookupOptions;
				numItems = field.lookupLen;
				labelKey = 'Title';
				valueKey = 'ID';
			}

			for(i = 0; i < items.length; i++) {
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
				items		= field.lookupOptions;
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


	
	function _createNewAttachments($this,id,listName){
		$('.jfspNewAttachmentLink').each(function(){
			var $newFile = $(this),
				fileName = $newFile.attr('data-filename'),
				bytes		= $newFile.attr('data-bytes');

			$().SPServices({
				operation: "AddAttachment",
				listName: listName,
				asynch: false,
				listItemID:id,
				fileName: fileName,
				attachment: bytes
			});
		});
	}

	function _deleteUnwantedAttachments($this,id,listName){	
		$('.jfspAttachments a.strike').each(function(){
			$().SPServices({
				operation: "DeleteAttachment",
				listName: listName,
				asynch: false,
				listItemID:id,
				url:this.href				
			});
		});
	}
	
	function _getReadAttachments(list,id){
		var sReturn = "<ul class='dialogAttachments'>";

		$().SPServices({
			operation:'GetAttachmentCollection',
			listName: list,
			async: false,
			ID: id,
			completefunc: function (xData, Status) {
				$(xData.responseXML).SPFilterNode("Attachment").each(function(){
					var url = $(this).text(),
						n=url.lastIndexOf("/") +1,
						filename = url.substr(n,url.length - n );

					sReturn	+= "<li><a href='" + url + "' target='_blank'><i class='icon-paperclip'></i> "+filename+"</a></li>";
				});
			}
		});
		sReturn += "</ul>";
		return sReturn;
	}

	function _getFormAttachments(list,id){
		var sReturn = "";

		$().SPServices({
			operation:'GetAttachmentCollection',
			listName: list,
			async: false,
			ID: id,
			completefunc: function (xData, Status) {
				$(xData.responseXML).SPFilterNode("Attachment").each(function(){
					var url = $(this).text(),
						n=url.lastIndexOf("/") +1,
						filename = url.substr(n,url.length - n );

					sReturn	+= "<li><a class='jfspCurrentAttachmentLink' data-filename='"+filename+"' href='" + url + "' target='_blank'><i class='icon-paperclip'></i> "+filename+" </a> <i class='jfspIconAttachDelete icon-remove-sign'></i></li>";
				});
			}
		});
		return sReturn;
	}

	
	
	function _handleFileChange($this,files){
		var fileLoader = new FileReader(),
			file = {},
			i=0;

		for(i = 0; i < files.length; i++) {
			file = files[i];
			fileLoader = new FileReader();
			fileLoader.filename = file.name;

			fileLoader.onload = function(){
				var data = this.result,
					filename = this.filename,
					n=data.indexOf(";base64,") + 8;
					data= data.substring(n);

				$('.jfspAttachments').append("<li><a class='jfspNewAttachmentLink' data-filename='"+filename+"' data-bytes='" + data + "' href='javascript:void(0)' target='_blank'><i class='icon-cloud-upload'></i> "+filename+ " </a> <i class='jfspIconAttachCancel icon-remove-sign'></i></li>");
			};

			fileLoader.onabort = function(){
				alert("The upload was aborted.");
			};

			fileLoader.onerror = function(){
				alert("An error occured while reading the file.");
			};

			fileLoader.readAsDataURL(file);
		}
	}

	function _safeValue(value){
		if (typeof(value) == "undefined"){
			value = '';
		}
		return value;
	}	
	
	function _xmlToJson(xml){		
		var obj = {};

		if (xml.nodeType == 1) { // element
			// do attributes
			if (xml.attributes.length > 0) {
				obj.attributes = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj.attributes[attribute.nodeName.replace('ows_','')] = attribute.nodeValue;
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
	}	
	
	function _formatOWSItem(item,idx){
		var aTmp = [],
			i = 0,			
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
				for(i = 0; i < aTmp.length; i=i+1) {
					if(aTmp[i].length){
						aValues[0].push(aTmp[i]);
					}
				}
			} else {
				for(i = 0; i < aTmp.length; i=i+2) {
					aValues[0].push(aTmp[i]);
					aValues[1].push(aTmp[i+1]);
				}
			}
			return aValues[idx];
		}
	}
})(jQuery);
