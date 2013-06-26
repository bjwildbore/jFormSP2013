; (function ($) {
    "use strict";

    var methods = {
        init: function (options) {
		
            var $this = $(this),
			settings = $.extend({
			    "dataListFields": "",
			    "ignoreFields": "",
			    "dataFieldConfig": [],	
				
			    "afterInit": function () { return true; },
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
			}, options);

            if (settings.dataListFields.length) {
                settings.dataListFields = settings.dataListFields.split(",");
            }

            if (settings.ignoreFields.length) {
                settings.ignoreFields = settings.ignoreFields.split(",");
            }

            $this.data("settings", settings);
			
            _prepareEditForm($this);
            _prepareDisplayForm($this);

            if (typeof settings.afterInit === "function") {
                if (!settings.afterInit.call(this, $this)) {
                    return false;
                }
            }

        },

		showDisplayForm:function(obj){
			console.log('showDisplayForm',obj);
			var $this = $(this),
				settings = $this.data("settings", settings);
			
			/*
			
				Do Stuff Here
			
			*/
			
			if (typeof settings.afterDialogShow === "function") {
                if (!settings.afterDialogShow.call(this, $this)) {
                    return false;
                }
            }			
			
			
		},
		
		showEditForm: function(obj){
			console.log('showEditForm',obj);
			var $this = $(this),
				settings = $this.data("settings", settings);
			
			
			/*
			
				Do Stuff Here
			
			*/
			
			if (typeof settings.afterDialogShow === "function") {
                if (!settings.afterDialogShow.call(this, $this)) {
                    return false;
                }
            }
		},

		addItem:function(list,values){
			console.log('addItem',obj);
			var $this = $(this),				
				settings = $this.data("settings", settings);
			
			if (typeof settings.beforeObjectAdd === "function") {
                if (!settings.beforeObjectAdd.call(this, $this)) {
                    return false;
                }
            }		
			
			$().SPServices({
				operation: "UpdateListItems",					
				listName: list,
				batchCmd: "New",					
				valuepairs: values,
				completefunc: function (xData, Status) {
					return true;
				}
			});
			
			
			
			if (typeof settings.afterObjectAdd === "function") {
                if (!settings.afterObjectAdd.call(this, $this)) {
                    return false;
                }
            }
		},		
		
		updateItem:function(list, id, values){
			console.log('removeItem',obj);
			var $this = $(this),				
				settings = $this.data("settings", settings);
			
			if (typeof settings.beforeObjectUpdate === "function") {
                if (!settings.beforeObjectUpdate.call(this, $this)) {
                    return false;
                }
            }
			
			
				
				$().SPServices({
					operation: "UpdateListItems",					
					listName: list,
					ID: ,
					//valuepairs: [['Title',obj.ows_Title]],
					valuepairs: values,
					completefunc: function (xData, Status) {
						return true;
					}
				});	
			
			
			
			if (typeof settings.afterObjectUpdate === "function") {
                if (!settings.afterObjectUpdate.call(this, $this)) {
                    return false;
                }
            }
		},
		
		removeItem: function(list,id){
			console.log('removeItem',obj);
			var $this = $(this),				
				settings = $this.data("settings", settings);
			
			if (typeof settings.beforeObjectRemove === "function") {
                if (!settings.beforeObjectRemove.call(this, $this)) {
                    return false;
                }
            }			
			
			$().SPServices({
				operation: "UpdateListItems",
				async: true,					
				batchCmd: "Delete",
				listName: list,
				ID: id,
				completefunc: function (xData, Status) {
					return true;
				}
			});
			

			
			if (typeof settings.afterObjectRemove === "function") {
                if (!settings.afterObjectRemove.call(this, $this)) {
                    return false;
                }
            }
			
			
		}
	

	/*
        createItem: function (obj) {
            var $this = $(this),
				settings = $this.data("settings"),
				trId = $this.attr("id") + "Tr",
				alert = "",
				sHtml = "";

            if (typeof settings.beforeObjectAdd === "function") {
                if (!settings.beforeObjectAdd.call(this, obj)) {
                    return false;
                }
            }

            sHtml = getDataTableRowHtml($this, obj);

            if (isIdUnique($this, obj.id)) {
                $("table", this).append(sHtml);
                $("#" + trId + "_" + obj.id).hide();
                $("#" + trId + "_" + obj.id).fadeIn('slow');

                $("#" + trId + "_" + obj.id).show();

                if (typeof jQuery.ui != 'undefined') {
                    $("#" + trId + "_" + obj.id + " td").effect("highlight", {}, 1000);
                }

                addArrayObject($this, obj);

                if (typeof settings.afterObjectAdd === "function") {
                    settings.afterObjectAdd.call(this, obj);
                }

                if (typeof settings.afterArrayChange === "function") { // make sure the callback is a function
                    settings.afterArrayChange.call(this, obj); // brings the scope to the callback
                }

            } else {
                alert("Non unique Id");
                return false;
            }

            return true;
        },

        updateItem: function (obj, origid) {
            var newHtml = "",
				$this = $(this),
				settings = $this.data("settings"),
				sHtml = getDataTableRowHtml($this, obj),
				trId = $this.attr("id") + "Tr";

            if (typeof settings.beforeObjectUpdate === "function") {
                if (!settings.beforeObjectUpdate.call(this, obj)) {
                    return false;
                }
            }

            newHtml = sHtml.replace("</tr>", "").replace(/<tr(?:.|\n)*?>/gm, "");
            $("#" + trId + "_" + origid).hide().empty();
            $("#" + trId + "_" + origid).append(newHtml);
            $("#" + trId + "_" + origid).show();

            if (typeof jQuery.ui != 'undefined') {
                $("#" + trId + "_" + origid + " td").effect("highlight", {}, 1000);
            }

            $("#" + trId + "_" + origid).attr("id", trId + "_" + obj.id);

            setArrayObject($this, obj, origid);

            if (typeof settings.afterObjectUpdate === "function") {
                settings.afterObjectUpdate.call(this, obj);
            }

            if (typeof settings.afterArrayChange === "function") { // make sure the callback is a function
                settings.afterArrayChange.call(this, obj); // brings the scope to the callback
            }


            return true;
        },

   

        editItem: function (id, dialogId) {
            var $this = $(this),
				settings = $this.data("settings");


            $("#" + dialogId + " .jfspDialogHeader span").html("Edit item");
            setDialogHtml($this, getArrayObject($this, id));

            $("#" + dialogId).fadeIn();

            $('html, body').animate({
                scrollTop: $("#" + dialogId).offset().top - 20
            }, 500);

            if (typeof settings.afterDialogShow === "function") {
                if (!settings.afterDialogShow.call(this)) {
                    return false;
                }
            }

        },

        deleteItem: function (id) {
            var $this = $(this),
				trId = $this.attr("id") + "Tr_" + id,
				settings = $this.data("settings"),
				obj = getArrayObject($this, id);

            if (typeof settings.beforeObjectRemove === "function") { // make sure the callback is a function
                if (!settings.beforeObjectRemove.call(this, obj)) {
                    return false;
                }
            }
			
            removeArrayObject($this, obj);
            $("#" + trId).remove();

            if (typeof settings.afterObjectRemove === "function") { // make sure the callback is a function
                settings.afterObjectRemove.call(this, obj); // brings the scope to the callback
            }

            if (typeof settings.afterArrayChange === "function") { // make sure the callback is a function
                settings.afterArrayChange.call(this, obj); // brings the scope to the callback
            }

        },


        addItem: function (dialogId) {
            var $this = $(this),
				settings = $this.data("settings");

            $("#" + dialogId + " .jfspDialogHeader span").html("Add item");
            setDialogHtml($this, []);

            $("#" + dialogId).fadeIn();

            $('html, body').animate({
                scrollTop: $("#" + dialogId).offset().top - 20
            }, 500);

            if (typeof settings.afterDialogShow === "function") {
                if (!settings.afterDialogShow.call(this)) {
                    return false;
                }
            }
        }

*/

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



	function _getItem($this, obj){
		console.log('_getItem');
		return false
	}


	function _prepareEditForm($this){
		console.log('_prepareEditForm');
		return false
	}

	function _prepareDisplayForm($this){
		console.log('_prepareDisplayForm');
		return false
	}






    function renderDialog($this) {
        var dialogId = $this.attr("id") + "Dialog",
			dialogHtml = "<div class='jfspDialog' title='Item' id='" + dialogId + "'>";

        dialogHtml += "<div class='jfspDialogHeader'><span>New Item</span></div>";
        dialogHtml += "<div class='jfspDialogItems'></div>";

        dialogHtml += "<div class='jfspDialogButtons'><a class='jfspDialogCancel' href='javascript:;'><i class='icon-undo'></i><span>Cancel</span></a>";
        dialogHtml += "<a class='jfspDialogSubmit' href='javascript:;'><i class='icon-ok'></i><span>OK</span></a></div>";
        dialogHtml += "</div>";

        $this.prepend(dialogHtml);

        if (typeof jQuery.ui != 'undefined') {
            $("#" + dialogId).draggable();
        }


        $("#" + dialogId).hide();

        $(".jfspDialogSubmit", $this).click(function (index, item) {
            var tmpObj = {},
				isValid = true,
				origId = $("#" + dialogId + " input[name='jfspDialogItemId']").val(),
				invalidMessage = "Please fill in all required fields";

            $.each($("#" + dialogId + " input:not(:checkbox):not(:radio),#" + dialogId + " textarea"), function (index, item) {
                var field = item.name,
					value = item.value,
					isRequired = ($(item).data('required') == '1') ? true : false;

                if (isRequired && !value.length) {
                    isValid = false;
                    invalidMessage = "Please fill in all required fields";
                }

                if (field !== "jfspDialogItemId") {
                    tmpObj[field] = item.value;
                }

            });

            $.each($("#" + dialogId + " select"), function (index, item) {
                var field = item.name,
					value = $(item).val(),
					isRequired = ($(item).data('required') == '1') ? true : false;

                if (isRequired && !value.length) {
                    isValid = false;
                    invalidMessage = "Please fill in all required fields";
                }

                tmpObj[field] = value;
            });

            $.each($("#" + dialogId + " .checkboxGroup"), function (index, item) {
                var field = $(item).data("name"),
					isRequired = ($(item).data('required') == '1') ? true : false,
					values = "";
                $.each($("input[name='" + field + "[]']:checked"), function () {
                    if (values.length !== 0) {
                        values += ',';
                    }
                    values += $(this).val();

                });

                if (isRequired && !values.length) {
                    isValid = false;
                    invalidMessage = "Please fill in all required fields";
                }

                tmpObj[field] = values;			
            });

            $.each($("#" + dialogId + " input:radio:checked"), function (index, item) {
                var field = item.name,
					value = $(item).val(),
					isRequired = ($(item).data('required') == '1') ? true : false;

                if (isRequired && !value.length) {
                    isValid = false;
                    invalidMessage = "Please fill in all required fields";
                }

                tmpObj[field] = value;
            });

            $.each($("#" + dialogId + " input[type='url']"), function (index, item) {
                var field = item.name,
					value = $(item).val();

                if (/^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value)) {
                    //alert("valid url");
                } else {
                    isValid = false;
                    invalidMessage = "Please enter a correct URL";
                }

                tmpObj[field] = value;

            });


            if (isValid) {
                if (origId === "") {
                    if ($this.jfsp("createItem", tmpObj)) {
                        $("#" + dialogId).fadeOut('fast');
                    }
                } else {
                    if ($this.jfsp("updateItem", tmpObj, origId)) {
                        $("#" + dialogId).fadeOut('fast');
                    }
                }
            } else {
                alert(invalidMessage);
            }


        });

        $(".jfspDialogCancel, .jfspDialogHeader a.icon", $this).click(function (index, item) {
            $("#" + dialogId).fadeOut('fast');
        });

        return $this;
    }



    function setDialogHtml($this, obj) {
        var sHtml = "",
			sOptions = "",
			key = "",
			i = 0,
			settings = $this.data("settings"),
			tmpObjects = $this.jfsp("getArrayObjects"),
			value = "",
			isNew = (obj.id) ? false : true;
        $("#" + $this.attr("id") + "Dialog .jfspDialogItems").empty();

        if (isNew) {
            sHtml += "<input name='jfspDialogItemId' type='hidden' value='' />";
        } else {
            sHtml += "<input name='jfspDialogItemId' type='hidden' value='" + obj.id + "' />";
        }

        if (settings.dataFieldConfig.length !== 0) {
            $.each(settings.dataFieldConfig, function (index, item) {

                var val = (isNew) ? "" : obj[item.field],
					isRequired = 0,
					inputID = '',
					sFieldClass = "";

                if (item.required === '1') {
                    isRequired = 1;
                    sFieldClass = "required ";
                }

                switch (item.type) {

                    case 'select':

                        sOptions = "<option value='' ";
                        if (isNew) {
                            sOptions += " selected ";
                        }
                        sOptions += " >Please select</option>";


                        for (i = 0; i < item.options.length; i++) {
                            sOptions += "<option value='" + item.options[i].value + "' ";
                            if (!isNew && item.options[i].value === obj[item.field]) {
                                sOptions += " selected ";
                            }
                            sOptions += " >" + item.options[i].label + "</option>";
                        }

                        sHtml += "<div class='" + sFieldClass + "' data-name='" + item.field + "'><span>" + item.title + "</span><select data-required='" + isRequired + "' name='" + item.field + "' " + item.attributes + " >";
                        sHtml += sOptions;
                        sHtml += "</select></div>";
                        break;

                    case 'checkbox':

                        sOptions = "";

                        for (i = 0; i < item.options.length; i++) {
                            inputID = 'check_' + item.field + '_' + i;
                            sOptions += "<input id='" + inputID + "'  type='checkbox' name='" + item.field + "[]' value='" + item.options[i].value + "' ";
                            if (!isNew && obj[item.field].indexOf(item.options[i].value) !== -1) {
                                sOptions += " checked='checked' ";
                            } else if (isNew && item.options[i].def === '1') {
                                sOptions += " checked='checked' ";
                            }
                            sOptions += " /><label for='" + inputID + "'>" + item.options[i].label + "</label><br />";
                        }

                        sHtml += "<div data-name='" + item.field + "' class='checkboxGroup" + sFieldClass + "'  data-required='" + isRequired + "' >";
                        sHtml += "<span>" + item.title + "</span>";
                        sHtml += sOptions;
                        sHtml += "</div>";
                        break;

                    case 'radio':

                        sOptions = "";

                        for (i = 0; i < item.options.length; i++) {
                            inputID = 'radio_' + item.field + '_' + i;
                            sOptions += "<input id='" + inputID + "' type='radio' name='" + item.field + "' value='" + item.options[i].value + "' ";


                            if (!isNew && obj[item.field] == item.options[i].value) {
                                sOptions += " checked='checked' ";
                            } else if (isNew && item.options[i].def === '1') {
                                sOptions += " checked='checked' ";
                            }
                            sOptions += " /><label for='" + inputID + "'>" + item.options[i].label + "</label><br />";
                        }

                        sHtml += "<div data-name='" + item.field + "' class='radioGroup" + sFieldClass + "'  data-required='" + isRequired + "' >";
                        sHtml += "<span>" + item.title + "</span>";
                        sHtml += sOptions;
                        sHtml += "</div>";
                        break;


                    case 'textarea':
                        sHtml += "<div class='" + sFieldClass + "' data-name='" + item.field + "'><span>" + item.title + "</span>";
                        sHtml += "<textarea name='" + item.field + "' " + item.attributes + "  data-required='" + isRequired + "' >" + val + "</textarea></div>";
                        break;
                    default:
                        sHtml += "<div class='" + sFieldClass + "' data-name='" + item.field + "'><span>" + item.title + "</span>";
                        sHtml += "<input name='" + item.field + "' value='" + val + "' type='" + item.type + "'  data-required='" + isRequired + "'  " + item.attributes + "  /></div>";
                }

            });

        } else {
            if (isNew) {
                for (key in tmpObjects[0]) {
                    if (tmpObjects[0].hasOwnProperty(key)) {
                        sHtml += "<div class='fieldcontainer' data-name='" + key + "'><label>" + key + "</label><input name='" + key + "' value='' /></div>";
                    }
                }
            } else {
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        value = obj[key];
                        sHtml += "<div class='fieldcontainer' data-name='" + key + "'><label>" + key + "</label><input name='" + key + "' value='" + value + "' /></div>";
                    }
                }
            }
        }

        $("#" + $this.attr("id") + "Dialog .jfspDialogItems").append(sHtml);
        $("#" + $this.attr("id") + "Dialog .required label").append("<i>*</i>");

        if ($("#" + $this.attr("id") + "Dialog input[name='id']").val() === "") {
            $("#" + $this.attr("id") + "Dialog input[name='id']").val(Math.round((new Date()).getTime()));
        }

        if (!settings.showDialogId) {
            $("#" + $this.attr("id") + "Dialog input[name='id']").parent().hide();
        }

        return $this;
    }

})(jQuery);
