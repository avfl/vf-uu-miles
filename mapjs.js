
// markerCluster = new MarkerClusterer(map, markers, {"minimumClusterSize":5,"gridSize":30, "styles":styles});
var map, markers = [], mc;
jQuery(document).ready(function($) {
  console.log('hi');
  $('#tabs a').click(function(e) {
      e.preventDefault();
      var el = $(this);
      var categoryId = el.attr('data-load');
      $('#loading').fadeIn();
      clearMarkers();
      clearClusters();
      $.getJSON( "https://script.google.com/macros/s/AKfycbwOTZO_ZuBza0T_xx9bQWl8NSTcLXTbLd8uzKw3kdo1Q9asKyZL/exec?categoryId=" + categoryId + "&prefix=?",displayMarkersByCategory);
      $('#tabs div').removeClass('active');
      $(el).parent().addClass('active');
    });
  $('#g2').parent().addClass('active');
  initializeMap();
  $.getJSON("https://script.google.com/macros/s/AKfycbwOTZO_ZuBza0T_xx9bQWl8NSTcLXTbLd8uzKw3kdo1Q9asKyZL/exec?categoryId=2&prefix=?&callback=?", function (data) { console.log(data); displayMarkersByCategory(data, 2); } );
  $('.close-button').click(function() {
      $(this).parent().fadeOut();
      $('html,body').animate({scrollTop: $('#outer-panel').offset().top}, 600);
    });
    
    
  $('#needassist-top').click(showWidget);
  $('#needassist-entity').click(showWidget);
  /*
  $('#entity-display-close-button').click(function(){
    if (map.getZoom() > 7) {
        $('#needassist-top').fadeOut();
      } else {
        $('#needassist-top').fadeIn();
      }
    });
    */
  $('#needassist-top-display-close-button').click(function() {
      if ($('#entity-info').css('display') != 'none') {
        $('html,body').animate({scrollTop: $('#entity-info').offset().top}, 600);
      }
    });
});


function showWidget() {
  jQuery('#resource-assistance-form').html('');
  var options = [];
  options['sel'] = '#resource-assistance-form';
  window.Uniteus.assistanceRequestWidget(options);
  setTimeout(function(){ jQuery('#resource-assistance-form-container').fadeIn(); jQuery('html,body').animate({scrollTop: jQuery('#outer-panel').offset().top}, 600); }, 1000);
}

function initializeMap() {
  var center = new google.maps.LatLng(27.992596, -82.7796287);
  var options = {
    zoom: 7,
    center: center,
    mapTypeControl: false,
    mapTypeId: google.maps.MapTypeId.TERRAIN
  };
  map = new google.maps.Map(document.getElementById('gmap'), options);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('loading'));
  //map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('entity-info'));
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('zoom-out'));
  jQuery('#zoom-out').click(function() {
      map.setZoom(7);
      map.setCenter(center);
      jQuery('#entity-display-close-button').click();
    });
  map.addListener('zoom_changed', function() {
      if (map.getZoom() > 7) {
        jQuery('#zoom-out').fadeIn();
        //jQuery('#needassist-top').fadeOut();
      } else {
        jQuery('#zoom-out').fadeOut();
        //jQuery('#needassist-top').fadeIn();
      }
    });
}

function displayMarkersByCategory(data, categoryId) {
  var data = JSON.parse(data);
  //var categoryId = dataArr[1];
  var cmarkers = setMarkersData(data, categoryId);
  mc = new MarkerClusterer(map, markers);
  jQuery('#loading').fadeOut();
  jQuery('.info-window-view-more').click(loadMoreInfo);
}

function loadMoreInfo(el) {
  jQuery('#entity-info').fadeOut();
  //jQuery('#needassist-top').fadeOut();
  var fetchId = el.getAttribute('data-id');
  console.log(fetchId);
  google.script.run.withSuccessHandler(displayEntityInfo).getEntityData(fetchId);
}
function displayEntityInfo(data) {
  var data = JSON.parse(data);
  console.log(data);
  if (data.accepts_assistance_requests == true || data.accepts_assistance_requests == 'true') {
    jQuery('#needassist-entity').fadeIn();
  } else {
    jQuery('#needassist-entity').css('display','none');
  }
  jQuery('#entity-name, #entity-description, #entity-avatar, #entity-address, #entity-website').empty();
  jQuery('#entity-name').html(data.name);
  jQuery('#entity-address').html(data.address.address_line1 + '<br/>' + data.address.city + ', ' + data.address.state + ' ' + data.address.zip);
  jQuery('#entity-website').html('<a href="' + data.website + '" target="_blank">' + data.website.replace('http://','') + '</a>');
  if (data.description && data.description != null) {
    jQuery('#entity-description').html(data.description.replace(/\n/g,'<br/>'));
  }
  if (data.avatar_url && data.avatar_url != null && data.avatar_url != 'holder') {
    jQuery('#entity-avatar').html('<img src="' + data.avatar_url + '"/>');
  }
  
  var categories = 'Best Categories for Assistance: <br/>';
  for (var i in data.categories) {
    categories += data.categories[i].name.toTitleCase() + ' &nbsp;&nbsp;';
  }
  jQuery('#entity-categories').html(categories);
  
  jQuery('#entity-info').fadeIn();
  jQuery('html,body').animate({scrollTop: jQuery('#entity-info').offset().top}, 600);
  
}
  
  
function setMarkersData(data, categoryId) {
  var infowindow = new google.maps.InfoWindow({maxWidth: 275});
  for (var i = 0; i < data.length; i ++) {
    var mp = data[i],
        icon = {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#3cba54',
          strokeColor: '#3cba54',
          scale: 4
        },
        assistance = ' <i class="fa fa-life-ring" style="color:#4885ed;font-weight:bold;"></i><br/><span style="font-size:0.75em;font-weight:normal;display:none;">accepts direct assistance requests as part of<br/>Veterans Florida statewide referral network</span> ';
        
    if (categoryId) {
      var size = new google.maps.Size(22,22);
      if (categoryId == 9) {
        icon = {
          url: 'http://www.veteransflorida.org/wp-content/uploads/2016/03/ic_nature_people_black_24dp_1x.png',
          scaledSize: size
        }
      } else if (categoryId == 2) {
        icon = {
          url: 'http://www.veteransflorida.org/wp-content/uploads/2016/03/ic_business_black_24dp_1x.png',
          scaledSize: size
        }
      } else if (categoryId == 1) {
        icon = {
          url: 'http://www.veteransflorida.org/wp-content/uploads/2016/03/ic_school_black_24dp_1x.png',
          scaledSize: size
        }
      }
    }
    if (!mp.accepts_assistance_requests || mp.accepts_assistance_requests == false || mp.accepts_assistance_requests == 'false') {
      assistance = '';
    }
    
    var bgDiv = '<div></div>';
    if (mp.avatar_url && mp.avatar_url != null && mp.avatar_url != 'holder') {
      bgDiv = '<div class="mp-info-window-bgdiv" style="background: #FFFFFF url(' + mp.avatar_url + ') center no-repeat;background-size:100%;"></div>'
    }
    
    var html = bgDiv + '<div class="mp-info-window"><h3>' + mp.name + ' ' + assistance + '</h3><br/><span class="info-window-view-more" data-id="' + mp.id + '" onclick="loadMoreInfo(this);">View More</span></div>';
    
    
    var latLng = new google.maps.LatLng(mp.lat, mp.lng);
    
    
    var marker = new google.maps.Marker({
      map: map,
      title: mp.name,
      html: html,
      icon: icon,
      cursor: 'pointer',
      position: latLng
    });
    
    /*
    var marker = new MarkerWithLabel({
      position: latLng,
      map: map,
      labelContent: mp.name,
      labelAnchor: new google.maps.Point(10, 0),
      html: html,
      icon: icon,
      cursor: 'default',
      labelClass: 'labels', // the CSS class for the label
      labelInBackground: true
    });
    */
      
    marker.addListener('click', function() {
        infowindow.setContent(this.html);
        infowindow.open(map, this);
      });
      
    infowindow.addListener('closeclick',function(){
        jQuery('#entity-display-close-button').click();
      });
      
    markers.push(marker);
  }
  return markers;
}

function clearMarkers() {
  for (var i in markers) {
    markers[i].setMap(null);
  }
  markers = [];
}
function clearClusters() {
  if (mc.getTotalClusters() > 0) {
    mc.clearMarkers();
  } else {
    return;
  }
}

String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

