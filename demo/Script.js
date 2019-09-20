var extension_path = Qva.Remote + "?public=only&name=Extensions/demo/";

function extension_Init()
{
	Qva.LoadScript(extension_path+'d3.v3.min.js', extension_Done()); 
} 

function extension_Done() {
	Qva.AddExtension('demo', function(){
		Qva.LoadCSS(extension_path + "style.css");
		var _this = this;	
		var divName = _this.Layout.ObjectId.replace("\\", "_");
		if(_this.Element.children.length == 0) {
			var ui = document.createElement("div");
			ui.setAttribute("id", divName);
			_this.Element.appendChild(ui);
		} else {
			$("#" + divName).empty();
		}

		//Width and height
		var width = 400;
		var height = 500;

		//Define map projection
		var projection = d3.geo.mercator()
							.center([5.3875, 52.155])
							.scale(5000);

		//Define path generator
		var path = d3.geo.path()
						.projection(projection);
							 
		//Define quantize scale to sort data values into buckets of color
		var color = d3.scale.quantize()
						.range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);
								

		//Create SVG element
		var svg = d3.select("#" + divName)
					.append("svg")
					.attr("width", width)
					.attr("height", height);
		
		//Create tooltip
		var tooltip = d3.select("#" + divName).append("div") 
				.attr("class", "tooltip")       
				.style("opacity", 0);		

		//Load in dimension and measure data
		var dataset = [];
		var textset = [];
		var td = _this.Data;

		//Set input domain for color scale
		color.domain([
			d3.min(td.Rows, function(d) {return d[1].text}), 
			d3.max(td.Rows, function(d) {return d[1].text})
		]); 
		
		var tooltip = d3.select("#" + divName)
						.append("div") 
						.attr("class", "tooltip")       
						.style("opacity", 0);
		
		//Load in GeoJSON data
		url = "https://geodata.nationaalgeoregister.nl/cbsgebiedsindelingen/wfs?service=wfs&request=GetFeature&typeName=cbs_arrondissementsgebied_2019_gegeneraliseerd&outputFormat=json&srsName=EPSG:4326";
		d3.json(url, function(json) {

			//Merge the data and GeoJSON
			//Loop through once for each data value
			for (var i = 0; i < td.Rows.length; i++) {
			
				//Find the corresponding feature inside the GeoJSON
				for (var j = 0; j < json.features.length; j++) {
				
					if (td.Rows[i][0].text == json.features[j].properties.statcode) {
						
						//Copy the data value into the JSON
						json.features[j].properties.value = parseFloat(td.Rows[i][1].text);
								
						//Stop looking through the JSON
						break;
								
					}
				}					
			}

			//Bind data and create one path per GeoJSON feature
			svg.selectAll("path")
				.data(json.features)
				.enter()
				.append("path")
				.attr("d", path)
    			.style("fill", function(d) {				   		
				   	if (d.properties.value) return color(d.properties.value);
					else return "#ccc";
				})				
				.on("mouseover", function(d) {    
						tooltip.transition()    
							   .duration(200)    
							   .style("opacity", .9);    
						tooltip.html(d.properties.statcode) /*  
							   .style("left", (d3.event.pageX) + "px")   
							   .style("top", (d3.event.pageY - 28) + "px") */;  
					})          
				.on("mouseout", function(d) {   
						tooltip.transition()   
							   .duration(500)    
				               .style("opacity", 0); 
				});
		});
	});
}

extension_Init();
