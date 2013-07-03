function loadFilters(){
		var aFilters = [],		
				
		filter = new fuiFilter('sources','Sources');
		filter.required = true;			
		filter.options = [
			{value:'courses',label:'Courses',selected:true},
			{value:'dates',label:'Dates',selected:true},
			{value:'availability',label:'Tutor Availability',selected:true},
			{value:'resources',label:'Resources',selected:true}

		];			
		aFilters.push(filter);
		
		filter = new fuiFilter('status','Status');
		filter.required = false;				
		filter.applyTo = ['courses'];		
		filter.options = [
			{value:'Confirmed',label:'Confirmed',selected:true},
			{value:'Tentative',label:'Tentative',selected:true},
			{value:'Cancelled',label:'Cancelled',selected:true}
		];
		
	
		aFilters.push(filter);	
			

		filter = new fuiFilter('region','Region');
		filter.required = true;				
		filter.applyTo = ['courses','dates','availability', 'resources'];
		filter.options  = $.jStorage.get("sc_"+filter.id);				
		if(!filter.options ){		  
		  filter.options = getRegionsArrayFromSP();			
		  $.jStorage.set("sc_"+filter.id, filter.options);		  
		}  					
		aFilters.push(filter);
		
		
		
		filter = new fuiFilter('location','Location');		
		filter.required = false;
		filter.parent = 'region';
		filter.applyTo =  ['courses','dates','availability', 'resources'];
		filter.options  = $.jStorage.get("sc_"+filter.id);				
		if(!filter.options ){		  
		  filter.options = getLocationsArrayFromSP();			
		  $.jStorage.set("sc_"+filter.id, filter.options);		  
		} 				
		aFilters.push(filter);	

		filter = new fuiFilter('type','Type');
		filter.required = false;				
		filter.applyTo = ['courses'];				
		filter.options  = $.jStorage.get("sc_"+filter.id);				
		if(!filter.options ){		  
		  filter.options = getTypesArrayFromSP();			
		  $.jStorage.set("sc_"+filter.id, filter.options);		  
		} 
		
		aFilters.push(filter);	
			
		
		filter = new fuiFilter('tutor','Tutor');
		filter.required = false;				
		filter.applyTo =  ['courses','availability'];			
		filter.options  = $.jStorage.get("sc_"+filter.id);				
		if(!filter.options ){		  
		  filter.options = getTutorsArrayFromSP();			
		  $.jStorage.set("sc_"+filter.id, filter.options);		  
		} 				
		aFilters.push(filter);	


	



		return aFilters;		
}





	function getRegionsArrayFromSP(){
	    //console.log("getRegionsArrayFromSP");

		var thisItem = new Object();
		var aRet = new Array();

		$().SPServices({
		    operation: "GetListItems",
		    async: false,		   	    
		    listName: "clinical_region",		   
		    completefunc: function (xData, Status) {
		      $(xData.responseXML).SPFilterNode("z:row").each(function() {			
				thisItem = {
					value:$(this).attr("ows_ID"),
					label:$(this).attr("ows_Title"),
					selected:true					
				};	
				aRet.push(thisItem);
		      });
		    }
		    
	  	});
	  	
	  	return aRet;
	}// end buildFilterDataArray function


	function getLocationsArrayFromSP(){
		//console.log("getLocationsArrayFromSP");

		var thisItem = new Object();	
		var aRet = new Array();

		$().SPServices({
		    operation: "GetListItems",
		    async: false,
		    listName: "clinical_location",
		    CAMLQuery: '<Query><OrderBy><FieldRef Name="Title" /></OrderBy></Query>',
		    CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Region' /></ViewFields>",
		    completefunc: function (xData, Status) {
		      

		      $(xData.responseXML).SPFilterNode("z:row").each(
		      function() {		
		     
			
		      		thisItem = {
					value:$(this).attr("ows_ID"),
					label:$(this).attr("ows_Title"),
					parent:formatOWSItem($(this).attr("ows_Region"),0),
					selected:true

				};
				aRet.push(thisItem);
		      });
		    }
	  	});
	  	
	  	return aRet;

	}





	function getTutorsArrayFromSP(){
		//console.log("getTutorsArrayFromSP");

		var thisItem = new Object();	
		var aRet = new Array();
	
		var sQuery = '<Query><OrderBy><FieldRef Name="Title" /></OrderBy></Query>';
		
		$().SPServices({
		    operation: "GetListItems",
		    async: false,
		    listName: "clinical_tutor",
		    CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /></ViewFields>",
		    CAMLQuery: sQuery ,
		    completefunc: function (xData, Status) {
		      $(xData.responseXML).SPFilterNode("z:row").each(function() {					
				thisItem = {
					value:$(this).attr("ows_ID"),					
					label:$(this).attr("ows_Title"),
					selected:true
				};
								
				aRet.push(thisItem);				
		     
 				});
		    }
	  	});	
		return aRet;
  	}





	function getTypesArrayFromSP(){
	    console.log("getTypesArrayFromSP");
		var thisItem = new Object();
		var aRet = new Array();
			
		$().SPServices({
		    operation: "GetListItems",
		    async: false,
		    listName: "clinical_course_type",
		    CAMLQuery: '<Query><OrderBy><FieldRef Name="Title" /></OrderBy></Query>',
		    CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /></ViewFields>",
		    completefunc: function (xData, Status) {
		      $(xData.responseXML).SPFilterNode("z:row").each(function() {					thisItem = {
					value:$(this).attr("ows_ID"),
					label:$(this).attr("ows_Title"),
					selected:true
				};
				aRet.push(thisItem);
		      });
		    }
	  	});
	  	return aRet;

	}

function formatOWSItem(item,idx){
	var aTmp = [],
		bFirst = true,
		aValues = [];
	
	aValues[0] = [];
	aValues[1] = [];	

	if(item === null || item === undefined ){
		return "";		        
	} else {
		aTmp = item.split(';#');
		for(var i = 0; i < aTmp.length; i=i+2) {			
			aValues[0].push(aTmp[i]);
			aValues[1].push(aTmp[i+1]);
		}
		
		return aValues[idx];
	}
}


	function clearBrowserCache(){	
		console.log('clearBrowserCache');	
	    $.jStorage.flush();
		$.cookie("sc_region","");		
		$.cookie("sc_tutor","");
		$.cookie("sc_location","");		
		$.cookie("sc_status","");
		$.cookie("sc_type","");
		$.cookie("sc_sources","");	
	  
	    //location.reload(true);	  	
	}


function getAvailability(dStart,dEnd){	   

		var thisItem =  new CalendarItem();
		var tmpStr = "";
		var aTmp = [];
		var sReportStartDate = dStart.getFullYear() +'-' + (dStart.getMonth()+1) +'-' + dStart.getDate();		

		var sReportEndDate = dEnd.getFullYear() +'-' + (dEnd.getMonth()+1) +'-' + dEnd.getDate();
		//console.log('<Query><Where><And><Geq><FieldRef Name="End_x0020_date" /><Value Type="DateTime">'+sReportStartDate +'</Value></Geq><Leq><FieldRef Name="Start_x0020_date" /><Value Type="DateTime">'+sReportEndDate +'</Value></Leq></And></Where>');

		$().SPServices({
		    operation: "GetListItems",
		    async: false,
			//cacheXML:true,
		    listName: "clinical_availability",
			CAMLQuery: '<Query><Where><And><Geq><FieldRef Name="EndDate" /><Value Type="DateTime">'+sReportStartDate +'</Value></Geq><Leq><FieldRef Name="StartDate" /><Value Type="DateTime">'+sReportEndDate +'</Value></Leq></And></Where></Query>',

		    CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Region' /><FieldRef Name='Location' /></ViewFields>",
		    completefunc: function (xData, Status) {

		     $(xData.responseXML).SPFilterNode("z:row").each(function() { 
				
				thisItem = new CalendarItem();
				thisItem.id = $(this).attr("ows_ID");
				thisItem.title = $(this).attr("ows_Title");
				thisItem.source = "availability";	
				thisItem.sourceID = "availability";	
				thisItem.tutor =formatOWSItem($(this).attr("ows_Tutor"),0);

				thisItem.sort = 2;						
				thisItem.url = "/Clinical/ClinicalTeam/Lists/clinical_availability/DispForm.aspx?ID="+$(this).attr("ows_ID");

				thisItem.start =  $(this).attr("ows_StartDate");
				thisItem.end = $(this).attr("ows_EndDate");					
				
				thisItem.className = "item_" + thisItem.source;

				aTmp.push(thisItem); 				
					
		      });

		    }
	  	});
	  	  	
	  	return aTmp;

	}



function getResources(dStart,dEnd){
	   //console.log('getResources');

		var thisItem =  new CalendarItem();
		var tmpStr = "";
		var aTmp = [];
		
		var sReportStartDate = dStart.getFullYear() +'-' + (dStart.getMonth()+1) +'-' + dStart.getDate();		

		var sReportEndDate = dEnd.getFullYear() +'-' + (dEnd.getMonth()+1) +'-' + dEnd.getDate();
		//console.log('<Query><Where><And><Geq><FieldRef Name="End_x0020_date" /><Value Type="DateTime">'+sReportStartDate +'</Value></Geq><Leq><FieldRef Name="Start_x0020_date" /><Value Type="DateTime">'+sReportEndDate +'</Value></Leq></And></Where>');

		$().SPServices({
		    operation: "GetListItems",
		    async: false,
		    //cacheXML:true,
		    listName: "clinical_resource",
			CAMLQuery: '<Query><Where><And><Geq><FieldRef Name="EndDate" /><Value Type="DateTime">'+sReportStartDate +'</Value></Geq><Leq><FieldRef Name="StartDate" /><Value Type="DateTime">'+sReportEndDate +'</Value></Leq></And></Where></Query>',

		    CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Region' /><FieldRef Name='Location' /></ViewFields>",
		    completefunc: function (xData, Status) {

		     $(xData.responseXML).SPFilterNode("z:row").each(function() { 
				
				thisItem = new CalendarItem();
				thisItem.id = $(this).attr("ows_ID");
				thisItem.title = $(this).attr("ows_Title");
				thisItem.source = "resources";		
				thisItem.sourceID = "resources";		

				thisItem.sort = 4;						
				thisItem.url = "/Clinical/ClinicalTeam/Lists/clinical_resource/DispForm.aspx?ID="+$(this).attr("ows_ID");

				thisItem.start =  $(this).attr("ows_StartDate");
				thisItem.end = $(this).attr("ows_EndDate");					
				
				thisItem.className = "item_" + thisItem.source;

				aTmp.push(thisItem); 				
					
		      });

		    }
	  	});
	  	  	
	  	return aTmp;

	}



	function getDates(dStart,dEnd){  
		//console.log('getDates' ,dStart,dEnd)

		var thisItem =  new CalendarItem(),
			tmpStr = "",
			aTmp = [],
			sReportStartDate = dStart.getFullYear() +'-' + (dStart.getMonth()+1) +'-' + dStart.getDate(),
			sReportEndDate = dEnd.getFullYear() +'-' + (dEnd.getMonth()+1) +'-' + dEnd.getDate();			

		$().SPServices({
		    operation: "GetListItems",
		    async: false,
			//cacheXML:true,
		    listName: "clinical_date",
			CAMLQuery: '<Query><Where><And><Geq><FieldRef Name="EndDate" /><Value Type="DateTime">'+sReportStartDate +'</Value></Geq><Leq><FieldRef Name="StartDate" /><Value Type="DateTime">'+sReportEndDate +'</Value></Leq></And></Where></Query>',
		    CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Region' /><FieldRef Name='Location' /></ViewFields>",
		    completefunc: function (xData, Status) {

		     $(xData.responseXML).SPFilterNode("z:row").each(function() { 
				
				thisItem = new CalendarItem();
				thisItem.id = $(this).attr("ows_ID");
				thisItem.title = $(this).attr("ows_Title");
				thisItem.source = "dates";	
				thisItem.sourceID = "dates";		

				thisItem.sort = 1;
				thisItem.region = formatOWSItem($(this).attr("ows_Region"),0);					
				thisItem.location = formatOWSItem($(this).attr("ows_Location"),0);				
				thisItem.url = "/Clinical/ClinicalTeam/Lists/clinical_date/DispForm.aspx?ID="+$(this).attr("ows_ID");
				
				thisItem.start =  $(this).attr("ows_StartDate");
				thisItem.end = $(this).attr("ows_EndDate");
				
				thisItem.className = "item_" + thisItem.source;
									

				aTmp.push(thisItem); 				
					
		      });

		    }
	  	});
	  	  	
	  	return aTmp;

	}




function getCourses(dStart,dEnd){	   
		//console.log('getCourses' ,dStart,dEnd)
		var thisItem =  new CalendarItem();
		var tmpStr = "";
		var aTmp = [];
		var sReportStartDate = dStart.getFullYear() +'-' + (dStart.getMonth()+1) +'-' + dStart.getDate();		

		var sReportEndDate = dEnd.getFullYear() +'-' + (dEnd.getMonth()+1) +'-' + dEnd.getDate();
		//console.log('<Query><Where><And><Geq><FieldRef Name="End_x0020_date" /><Value Type="DateTime">'+sReportStartDate +'</Value></Geq><Leq><FieldRef Name="Start_x0020_date" /><Value Type="DateTime">'+sReportEndDate +'</Value></Leq></And></Where>');

		$().SPServices({
		    operation: "GetListItems",
		    async: false,
			//cacheXML:true,
		    listName: "clinical_course",
			CAMLQuery: '<Query><Where><And><Geq><FieldRef Name="EndDate" /><Value Type="DateTime">'+sReportStartDate +'</Value></Geq><Leq><FieldRef Name="StartDate" /><Value Type="DateTime">'+sReportEndDate +'</Value></Leq></And></Where></Query>',

		    CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Region' /><FieldRef Name='Tutors' /><FieldRef Name='CourseType' /><FieldRef Name='Status' /><FieldRef Name='Location' /></ViewFields>",
		    completefunc: function (xData, Status) {

		     $(xData.responseXML).SPFilterNode("z:row").each(function() { 				

				thisItem = new CalendarItem();
				thisItem.id = $(this).attr("ows_ID");
				thisItem.title = $(this).attr("ows_Title");							
				thisItem.source = "courses";
				thisItem.sourceID = "courses";

				thisItem.type = formatOWSItem($(this).attr("ows_CourseType"),0);
				thisItem.status = $(this).attr("ows_Status");
				thisItem.region = formatOWSItem($(this).attr("ows_Region"),0);
				thisItem.location = formatOWSItem($(this).attr("ows_Location"),0);
				thisItem.tutor =  formatOWSItem($(this).attr("ows_Tutors"),0);
				
				thisItem.sort = 3;						
				thisItem.url = "/Clinical/ClinicalTeam/Lists/clinical_course/DispForm.aspx?ID="+$(this).attr("ows_ID");

				thisItem.start =  $(this).attr("ows_StartDate");
				thisItem.end = $(this).attr("ows_EndDate");					
				
				thisItem.className = "item_" + thisItem.source + " item_" + thisItem.status;

				aTmp.push(thisItem); 	


					
		      });

		    }
	  	}); 
	  	  	
	  	return aTmp;

	}

			
	function formatOwsDate(d){	
		console.log('formatOwsDate',d); 

		var	sDateSplit = d.split(' ');
		var	sTimeSplit = sDateSplit[1].split(':');
		var	sDateSplit = sDateSplit[0].split('-');
		var	sTime = sTimeSplit[0] +":" +sTimeSplit[1];				
		var	sDate =  sDateSplit[2]+"/"+sDateSplit[1]+"/"+ sDateSplit[0];
        
        return(sDate +" (" +sTime +")" );
	}



function formatDisplayField($data,attr,label,owsDateFormat,owsFormat,owsFormatIndex){
	//console.log('formatDisplayField',$data,attr,label); 
	var attrVal = $data.attr(attr), 
	sReturn = ""; 
	//console.log(attrVal);


	if(typeof attrVal !== 'undefined' && attrVal.length){
		if(owsDateFormat){
			attrVal  = formatOwsDate(attrVal);

		} else if(owsFormat){
			attrVal  = formatOWSItem(attrVal,owsFormatIndex);
		}
	
		sReturn +="<div data-field='"+attr+"'>";
		if(label.length){
			sReturn +='<span>' + label + ": </span>"; 
		}
		sReturn += attrVal+"</div>";
	}
	
	return sReturn;
}
	
	
function formatAttachments(list,id){
console.log('formatAttachments',list,id)
	var sReturn = "<ul class='dialogAttachments'>";
	
	$().SPServices({
		operation:'GetAttachmentCollection',
		listName: list, 
		async: false,

		ID: id,
		completefunc: function (xData, Status) {
				
			$(xData.responseXML).SPFilterNode("Attachment").each(function() {
				console.log($(this).text());
				
				
				var url = $(this).text(),
					n=url.lastIndexOf("/") +1,
					filename = url.substr(n,url.length - n );
				
				sReturn  += "<li><a href='" + url + "'><img src='/_layouts/images/attach.gif' alt='Attachment'/> "+filename+"</a></li>";
			});
			
		}
	});
	
	sReturn += "</ul>";
	
	console.log(sReturn)

	return sReturn

}	
	
	
	
function displayToolTip(data,source){ 
	console.log('displayToolTip',data,source); 
	var $data = $(data),
		dialogHtml = 	"<div id='dialogInner' class='dialog_"+source+"'>";
						dialogHtml += "<div id='dialogInnerTitle'>";
		
						//dialogHtml += "<div data-field = 'ows_Title'>"+ $data.attr("ows_Title")+"</div>";
					 							
					 	dialogHtml += formatDisplayField($data,'ows_Title','',false,false,0);
					 	dialogHtml += formatDisplayField($data,'ows_Status','',false,false,0);
					 	dialogHtml += formatDisplayField($data,'ows_CourseType','Type',false,true,1);
			

					 
					 	dialogHtml += "</div>";	
					 	dialogHtml += "<div id='dialogInnerBody'>";		 
						
						//"<div data-field = 'ows_ID'>"+ $data.attr("ows_ID")+"</div>";
				       
				        	dialogHtml += formatDisplayField($data,'ows_Tutors','Tutors',false,true,1);
				        	dialogHtml += formatDisplayField($data,'ows_Tutor','Tutor',false,true,1);
				        	dialogHtml += formatDisplayField($data,'ows_Region','Region',false,true,1);
							dialogHtml += formatDisplayField($data,'ows_Location','Location',false,true,1);

						
						
							dialogHtml += formatDisplayField($data,'ows_StartDate','Start',true,false,0);
							dialogHtml += formatDisplayField($data,'ows_EndDate','End',true,false,0);
						
						
							dialogHtml += formatDisplayField($data,'ows_Notes','Notes',false,false,0);
							
							dialogHtml += formatDisplayField($data,'ows_AvailabilityType','Availability Type',false,true,1);				
							dialogHtml += formatDisplayField($data,'ows_Vehicle','Vehicle',false,true,1);
							dialogHtml += formatDisplayField($data,'ows_Venue','Venue',false,false,0);
							dialogHtml += formatDisplayField($data,'ows_Accommodation','Accommodation',false,false,0);
							dialogHtml += formatDisplayField($data,'ows_Equipment','Equipment',false,false,0);
							dialogHtml += formatDisplayField($data,'ows_Flights','Flights',false,false,0);
							dialogHtml += formatDisplayField($data,'ows_CourseRegister','Course Register',false,false,0);
							dialogHtml += formatDisplayField($data,'ows_Attachments','Attachments',false,false,0);

							if($data.attr("ows_Attachments") == 1){
								dialogHtml += formatAttachments(source,$data.attr("ows_ID"));
							}
						dialogHtml +="</div></div>";				
		$.modal(dialogHtml );
		

}