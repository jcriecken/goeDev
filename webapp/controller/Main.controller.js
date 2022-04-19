sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("dev.geoGeoDev.controller.Main", {

		onInit: function() {

			var oMapConfig = {
				"MapProvider": [{
					"name": "OSM",
					"type": "",
					"description": "Test",
					"tileX": "256",
					"tileY": "256",
					"maxLOD": "30",
					"copyright": "Tiles Courtesy of Google Maps",
					"Source": [{
						"id": "s1",
						"url": 'https://a.tile.openstreetmap.org/{LOD}/{X}/{Y}.png'
					}]
				}],
				"MapLayerStacks": [{
					"name": "OSM",
					"MapLayer": {
						"name": "layer2",
						"refMapProvider": "OSM",
						"opacity": "6.0",
						"colBkgnd": "RGB(255,255,255)"
					}
				}]
			};

			var sGeoJson =
				`{
				"type": "Feature",
				"properties": {},
				"geometry": {
					"type": "Polygon",
					"coordinates": [
						[
							[
								2.4609375,
								44.59046718130883
							],
							[
								24.2578125,
								44.59046718130883
							],
							[
								24.2578125,
								54.16243396806779
							],
							[
								2.4609375,
								54.16243396806779
							],
							[
								2.4609375,
								44.59046718130883
							]
						]
					]
				}
			}`;

			var oGeoJSON = JSON.parse(sGeoJson);

			this.oGeoJson = JSON.parse(sGeoJson);

			this.oDimensions = {
				maxLat: 0,
				minLat: 180,
				maxLong: 0,
				minLong: 180,
				meanLat: 0,
				meanLong: 0,
				height: 0,
				width: 0
			};

			var that = this;

			this.oGeoJson.geometry.coordinates[0].forEach(function(coordinate) {
				if (coordinate[0] > that.oDimensions.maxLat) {
					that.oDimensions.maxLat = coordinate[0];
				};
				if (coordinate[1] > that.oDimensions.maxLong) {
					that.oDimensions.maxLong = coordinate[1];
				};
				if (coordinate[0] < that.oDimensions.minLat) {
					that.oDimensions.minLat = coordinate[0];
				};
				if (coordinate[1] < that.oDimensions.minLong) {
					that.oDimensions.minLong = coordinate[1];
				};
			})

			this.oDimensions.meanLong = (this.oDimensions.maxLong + this.oDimensions.minLong) / 2;
			this.oDimensions.meanLat = (this.oDimensions.maxLat + this.oDimensions.minLat) / 2;
			this.oDimensions.height = this.oDimensions.maxLat - this.oDimensions.minLat;
			this.oDimensions.width = this.oDimensions.maxLong - this.oDimensions.minLong;

			var oGeoMap = this.byId("geoMap");
			var oGeoJsonLayer = new sap.ui.vbm.GeoJsonLayer();

			oGeoMap.addGeoJsonLayer(oGeoJsonLayer);

			console.log(this);

			oGeoJsonLayer.addData(oGeoJSON.geometry);
			oGeoJsonLayer.setDefaultFillColor("rgba(155,155,155, 0.1)");
			oGeoJsonLayer.setDefaultBorderColor("rgba(255,5,5,1)");

			oGeoMap.setMapConfiguration(oMapConfig);
			oGeoMap.setRefMapLayerStack("OSM");
			oGeoMap.setZoomlevel(3);

			this.PositionToZoomLevel = [];
			this.oViewport = {};

		},

		onPress: function(oClick) {
			var oGeoMap = this.byId("geoMap")
			var oVisualFrame = oGeoMap.getVisualFrame();

			oGeoMap.setCenterPosition(this.oDimensions.meanLat + ";" + this.oDimensions.meanLong);
			this.zoomToTarget();

		},

		onZoomChanged: function(oChange) {
			console.log(oChange.getParameters());
			var oViewPort = oChange.getParameters().viewportBB;
			var sZoomLevel = oChange.getParameters().zoomLevel

			var oVieportDistances = {};
			oVieportDistances.upperLeftPos = oViewPort.upperLeft;
			oVieportDistances.lowerRightPos = oViewPort.lowerRight;

			var uL = oVieportDistances.upperLeftPos.split(";");
			var lR = oVieportDistances.lowerRightPos.split(";");

			oVieportDistances.ulLong = uL[0];
			oVieportDistances.ulLat = uL[1];

			oVieportDistances.lrLong = lR[0];
			oVieportDistances.lrLat = lR[1];

			oVieportDistances.absoluteDistanceLong = Math.abs(uL[0] - lR[0]);
			oVieportDistances.absoluteDistanceLat = Math.abs(uL[1] - lR[1]);

			this.PositionToZoomLevel.push({
				'zoomLevel': sZoomLevel,
				'absLat': oVieportDistances.absoluteDistanceLat,
				'absLong': oVieportDistances.absoluteDistanceLong
			})

			this.oViewport.currentViewport = oViewPort;
			this.oViewport.absLat = oVieportDistances.absoluteDistanceLat;
			this.oViewport.absLong = oVieportDistances.absoluteDistanceLong;

			console.log(this.PositionToZoomLevel);

		},

		zoomToTarget: function() {
			
			var latRatio = (this.oViewport.absLat / this.oDimensions.height);
			var longRatio = (this.oViewport.absLong / this.oDimensions.width);

			if ( latRatio > 2 && longRatio > 2 ) {
				
				this.byId("geoMap").setZoomlevel(this.byId("geoMap").getZoomlevel() + 1);
				this.zoomToTarget();
				
			}

		}

	});
});