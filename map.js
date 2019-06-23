var btn, field, type, data, chartExpand;
var p = new Array();
var field = "GDP";
var type = "bar";
require([
	"esri/Map",
	"esri/layers/GeoJSONLayer",
	"esri/views/MapView",
	"esri/widgets/Legend",
	"esri/widgets/Expand",
	"esri/layers/CSVLayer",
	"esri/geometry/geometryEngine",
	"esri/Graphic"
], function(Map, GeoJSONLayer, MapView, Legend, Expand, CSVLayer, geometryEngine, Graphic) {
	var basemaps = [
		"streets",
		"topo",
		"hybrid",
		"terrain",
		"osm"
	];
	var slt = document.getElementById("slt");
	slt.addEventListener('change', function(e) {
		var index = slt.selectedIndex;
		field = slt.options[index].text;
		if (field == "GDP") {
			p[0] = data.GDP2012;
			p[1] = data.GDP2013;
			p[2] = data.GDP2014;
			p[3] = data.GDP2015;
			p[4] = data.GDP2016;
			getChart(p, field, type);
		} else if (field == "GDP增速") {
			p[0] = data.speed2012;
			p[1] = data.speed2013;
			p[2] = data.speed2014;
			p[3] = data.speed2015;
			p[4] = data.speed2016;
		} else if (field == "单位GDP综合能耗") {
			p[0] = data.nenghao2012;
			p[1] = data.nenghao2013;
			p[2] = data.nenghao2014;
			p[3] = data.nenghao2015;
			p[4] = data.nenghao2016;
		}
		getChart(p, field, type);
	});
	var slt2 = document.getElementById("slt2");
	slt2.addEventListener('change', function(e) {
		var index = slt2.selectedIndex;
		type = slt2.options[index].value;
		getChart(p, field, type);
	})

	btn = function(value, key, d) {
		data = d;
		p[0] = data.GDP2012;
		p[1] = data.GDP2013;
		p[2] = data.GDP2014;
		p[3] = data.GDP2015;
		p[4] = data.GDP2016;
		getChart(p, field, type);
	}

	var ppt = {
		title: "{NAME}",
		content: [{
				type: "fields",
				fieldInfos: [{
						fieldName: "文物",
						label: "文物保护区"
					},
					{
						fieldName: "国家级",
						label: "国家级风景区"
					}
				]
			},
			{
				type: "text",
				text: '{2012GDP:btn}'
			}
		]
	};
	var defaultSym = {
		type: "simple-fill",
		outline: {
			color: "#AEEEEE",
			width: "0.5px"
		}
	};
	var renderer = {
		type: "simple",
		symbol: defaultSym,
		label: "武汉市各中心城区",
		visualVariables: [{
			type: "color",
			field: "国家级",
			legendOptions: {
				title: "国家级风景区数量"
			},
			stops: [{
					value: 0,
					color: "rgb(240,236,170)",
					label: "0"
				},
				{
					value: 3,
					color: "rgb(166,145,101)",
					label: "3"
				},
				{
					value: 6,
					color: "rgb(102,72,48)",
					label: "6"
				}
			]
		}]
	};
	chartExpand = new Expand({
		expandIconClass: "esri-icon-chart",
		expandTooltip: "Population pyramid chart",
		expanded: false,
		view: view,
		content: document.getElementById("mychart")
	});
	var geojsonLayer = new GeoJSONLayer({
		title: "武汉市中心城区",
		url: "https://jykwyl.github.io/webgis16/wu.geojson",
		popupTemplate: ppt,
		renderer: renderer
	});
	var render2 = {
		type: "simple",
		symbol: {
			type: "simple-marker",
			outline: {
				color: [0, 0, 0, 0.5],
				width: "0.5px"
			},
			size: 8
		},
		label: "武汉轨道交通站点",
		visualVariables: [{
			type: "color",
			field: "number",
			stops: [{
					value: 0,
					color: "#00EE00",
					label: "0"
				},
				{
					value: 2,
					color: "#FFFF00",
					label: "2"
				},
				{
					value: 4,
					color: "#FF0000",
					label: "4"
				}
			]
		}]
	};
	var ppt2 = {
		title: "{name}",
		content: [{
			type: "fields",
			fieldInfos: [{
					fieldName: "number",
					label: "路线数量"
				},
				{
					fieldName: "address",
					label: "路线"
				},
				{
					fieldName: "getin",
					label: "getin"
				},
				{
					fieldName: "getout",
					label: "getinout"
				}
			]
		}]
	};
	var csvLayer = new CSVLayer({
		title: "武汉轨道交通站点",
		url: "https://jykwyl.github.io/webgis16/sitedata.csv",
		latitudeField: "Lat",
		longitudeField: "Lng",
		popupTemplate: ppt2,
		renderer: render2
	});
	var map = new Map({
		basemap: basemaps[0]
	});
	var view = new MapView({
		container: "viewDiv",
		center: [114.3, 30.6],
		zoom: 10,
		map: map
	});
	var layers = [
		"武汉市中心城区",
		"武汉轨道交通站点"
	];
	view.ui.add(chartExpand, "top-right");
	view.ui.add(
		new Legend({
			view: view
		}),
		"bottom-left"
	);
	//显示比例尺，经纬度
	var coordsWidget = document.createElement("div");
	coordsWidget.id = "coordsWidget";
	coordsWidget.className = "esri-widget esri-component";
	coordsWidget.style.padding = "7px 15px 5px";

	view.ui.add(coordsWidget, "bottom-right");

	function showCoordinates(pt) {
		var coords = "Lat/Lon " + pt.latitude.toFixed(3) + " " + pt.longitude.toFixed(3) +
			" | Scale 1:" + Math.round(view.scale * 1) / 1 +
			" | Zoom " + view.zoom;
		coordsWidget.innerHTML = coords;
	}

	view.watch("stationary", function(isStationary) {
		showCoordinates(view.center);
	});

	view.on("pointer-move", function(evt) {
		showCoordinates(view.toMap({
			x: evt.x,
			y: evt.y
		}));
	});
	document.querySelector(".btns").addEventListener("click", function(event) {
		var id = event.target.getAttribute("value");
		if (id) {
			view.map.basemap = basemaps[id];
		}
	});
	var select = document.getElementById("test");
	var FeatureLayers = [geojsonLayer, csvLayer];
	var x = 0;
	document.querySelector(".checks").addEventListener("click", function(event) {
		var id = event.target.getAttribute("id");
		if (document.getElementById(id).checked) {
			select.options.add(new Option(layers[id], id));
			select.options[x].selected = "selected";
			x++;
			view.map.add(FeatureLayers[id]);
		} else {
			for (var i = 0; i < select.length; i++) {
				if (select.options[i].value == id) {
					select.options.remove(i);
					x--;
					view.map.remove(FeatureLayers[id]);
				}
			}
		}
	});
	document.querySelector(".slt").addEventListener("click", function(event) {
		for (var i = 0; i < select.length; i++) {
			if (select.options[i].selected) {
				FeatureLayers[select.options[i].value].visible = true;
			} else {
				FeatureLayers[select.options[i].value].visible = false;
			}
		}
	});
	var buffer = document.getElementById("buf2");
	document.querySelector(".buffer").addEventListener("click", function(event) {
		var id = event.target.getAttribute("id");
		if (document.getElementById(id).checked) {
			buffer.style.display = "block";
			queryForWellGeometries().then(createBuffer);
		} else {
			buffer.style.display = "none";
			view.graphics.removeAll();
		}
	});
	var distanceSlider = document.getElementById("distance");
	var wellBuffer, wellsGeometries;

	function queryForWellGeometries() {
		var wellsQuery = csvLayer.createQuery();
		return csvLayer.queryFeatures(wellsQuery).then(function(response) {
			wellsGeometries = response.features.map(function(feature) {
				return feature.geometry;
			});
			return wellsGeometries;
		});
	}

	function createBuffer(wellPoints) {
		var bufferDistance = parseInt(distanceSlider.value);
		var wellBuffers = geometryEngine.geodesicBuffer(
			wellPoints, [bufferDistance],
			"meters",
			true
		);
		wellBuffer = wellBuffers[0];
		var bufferGraphic = new Graphic({
			geometry: wellBuffer,
			symbol: {
				type: "simple-fill",
				outline: {
					width: 1.5,
					color: [255, 128, 0, 0.5]
				},
				color: [255, 128, 0, 0.5]
			}
		});
		view.graphics.removeAll();
		view.graphics.add(bufferGraphic);
	}
	distanceSlider.addEventListener("input", function() {
		document.getElementById("distance-value").innerText = distanceSlider.value;
	});
	distanceSlider.addEventListener("change", function() {
		createBuffer(wellsGeometries);
	});
});
