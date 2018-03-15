/* map
====================================================*/
var marker, search, trafficLayer;
var map, r;
var iDir, info;
var directionsDisplay;
var directionsService;

// init map
function initMap() {
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer({
    polylineOptions: {
      strokeColor: "#4dd2ff",
      strokeWeight: 3,
      strokeOpacity: 1.0
    }
  });
	var uluru = new google.maps.LatLng(36.800248, 10.185209);
  info = new google.maps.InfoWindow({
      content: "<div id='dis'></div>"
    });

  // Styles a map in night mode.
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 17,
    center: uluru,
    zoomControl: false,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false

  });

  trafficLayer = new google.maps.TrafficLayer();
  trafficLayer.setMap(map);

  var icon = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: 'blue',
      fillOpacity: 0.8,
      scale: 8,
      strokeColor: 'black',
      strokeWeight: 1,
      rotation: 0
    };
  marker = new google.maps.Marker({
    position: uluru,
    icon: icon,
    map: map
  });

    var dirIcon = {
    url: '../static/img/direction.png',
    scaledSize: new google.maps.Size(40, 50),
    rotation: 0,
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(20,25)
  };
  dir = new google.maps.Marker({
    position: null,
    icon: dirIcon,
    map: map
  });

  var iDirIcon = {
    url: '../static/img/dirmarker.png',
    scaledSize: new google.maps.Size(40, 50),
    rotation: 0,
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(20,25)
  };
  iDir = new google.maps.Marker({
    position: null,
    icon: iDirIcon,
    map: map
  });

  map.setCenter(uluru);



/*
 map.addListener('center_changed', function() {
    window.setTimeout(function() {
      map.panTo(marker.getPosition());
      map.setZoom(17);
    }, 5000);
  });
*/
  marker.addListener('click', function() {
    map.setZoom(17);
    map.setCenter(marker.getPosition());
  });

  iDir.addListener("click",  function () {
      var start = marker.getPosition();
      var end = iDir.getPosition();
      dir.setPosition(iDir.getPosition());
      iDir.setPosition(null);
      info.open(map, dir);
      calcRoute(start, end);

  });

    $(document).on ("click", "#gps", function () {
        map.setZoom(17);
        map.setCenter(marker.getPosition());
    });
    $(document).on ("click", "#clear", function () {
        map.setZoom(17);
        map.setCenter(marker.getPosition());
        iDir.setPosition(null);
        dir.setPosition(null);
        directionsDisplay.set('directions', null);
        info.open(null);

    });
    $(document).on ("click", "#search", function () {
        map.setZoom(17);
        map.setCenter(marker.getPosition());
    });

    google.maps.event.addListener(map, "click", function (event) {
      info.open(null);
      //directionsDisplay.set('directions', null);
      var latitude = event.latLng.lat();
      var longitude = event.latLng.lng();
      iDir.setPosition(new google.maps.LatLng(latitude, longitude));
    });

  directionsDisplay.setMap(map);
  directionsDisplay.setOptions({ suppressMarkers: true });

  //google.maps.event.addDomListener(window, 'load', initMap);

}
// calculate the route between 2 points
function calcRoute(start, end) {
  var request = {
    origin: start,
    destination: end,
    travelMode: 'DRIVING'
  };
  directionsService.route(request, function(result, status) {
    if (status == 'OK') {
      directionsDisplay.setDirections(result);
      r = result;
      $("#dis").html("<span>Distance:"+ r.routes[0].legs[0].distance.text+"</span><br><span>Duration:"+ r.routes[0].legs[0].duration.text+"</span>");
    }
  });
}

/*
key board
====================================*/
$('#keyboard').focus(function() {
  $('#input').css("box-shadow", "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)");
});

$(document).ready(function() {

  $('#keyboard').keyboard({
      usePreview: false,
      accepted: function(e, keyboard, el){
            $('#keyboard').val(el.value);
          },
      change: function(e, keyboard, el) {
              console.log(el.value);
          }
    })
    // activate the typing extension
    .addTyping({
      showTyping: true,
      delay: 250
    });

});
$(document).on ("click", "#lookup", function () {
  console.log($("input#keyboard").val());
});
$(document).on ("click", "#lclear", function () {
  $("input#keyboard").val("");
});



/*
  get data from server
====================================*/
function getGps() {
      setInterval(function(){
        $.getJSON( "/gpsdata", function( data, status ) {
            if(status == 'success') {
                var gps = {lat: parseFloat(data.Lat), lng: parseFloat(data.Long)};
                var color = "";
                switch (String(data.state)) {
                  case 'H':
                    color = 'gray';
                    break;
                  case 'O':
                    color = 'red';
                    break;
                  case 'L':
                    color = 'green';
                    break;
                  default:
                    color = 'gray';
                    break;
                }
                marker.setPosition(gps);
                  var i = {
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    fillColor: color,
                    fillOpacity: 0.8,
                    scale: 8,
                    strokeColor: 'black',
                    strokeWeight: 1,
                    rotation: parseInt(data.angle)
                  };

                  var m = new google.maps.Marker({
                    position: gps,
                    icon: i,
                    map: map
                  });
                map.setCenter(m.getPosition());
		dashDisplay(data);
            }
        });

      }, 3000);
}