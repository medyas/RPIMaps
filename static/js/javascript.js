var index = 0;
var playing = false, mapRef = true, smenu = false;
var trackCount = 0;
var toggle = true;
var adsTrack = [];
var adsCount = 0;
var adsTime = 0.0;

/*============================================*/


$(document).ready(function() {
    // display the current time in the dashboard
    startTime();
    // get gps data
    getGps();
    // get ads links from server
    getVideo();
    // get the music playlist
 setTimeout(function(){ refresh("/getmusic", "plFav"); }, 500);
    

// display the speed meter
$(".GaugeMeter").gaugeMeter();

    /*
    audio
    ==================================================*/
    var supportsAudio = !!document.createElement('audio').canPlayType;
    if (supportsAudio) {

      $('#audio1').bind('play', function () {
                playing = true;
                $('#npAction').html('Now Playing... <span onclick="refresh()" class="fas fa-sync-alt" id="reload"></span>');
            }).bind('pause', function () {
                playing = false;
                $('#npAction').html('Paused... <span onclick="refresh()" class="fas fa-sync-alt" id="reload"></span>');
            }).bind('ended', function () {
                $('#npAction').html('Paused... <span onclick="refresh()" class="fas fa-sync-alt" id="reload"></span>');
                if ((index + 1) < trackCount) {
                    index++;
                    playaudio(index);
                    $('#audio1').get(0).play();
                } else {
                    $('#audio1').get(0).pause();
                    index = 0;
                    playaudio(index);
                }
            }).bind('playing', function() {
                //console.log(calculateTime($('#audio1').get(0).currentTime,$('#audio1').get(0).duration));
            }).bind('timeupdate', function() {
                $('#plList li:eq(' + index + ')').find(".plLength").text(calculateTime(this.currentTime,this.duration));
            }).get(0);
        $('#btnPrev').click(function () {
            if($('#plList li').length != 0) {
                if ((index - 1) > -1) {
                    index--;
                    playaudio(index);
                    if (playing) {
                        $('#audio1').get(0).play();
                    }
                } else {
                    $('#audio1').get(0).pause();
                    index = 0;
                    playaudio(index);
                }
            }
            else {
                $.when( refresh("/getmusic", "plFav") ).done(function() {
                        playaudio(index);
                        $('#audio1').get(0).play();
                        playing = true;
                  }
                );
            }
        });
        $('#btnNext').click(function () {
            if($('#plList li').length != 0) {
                if ((index + 1) < trackCount) {
                    index++;
                    playaudio(index);
                    if (playing) {
                        $('#audio1').get(0).play();
                    }
                } else {
                    $('#audio1').get(0).pause();
                    index = 0;
                    playaudio(index);
                }
            }
            else {
                $.when( refresh("/getaudio", "") ).done(function() {
                        playaudio(index);
                        $('#audio1').get(0).play();
                        playing = true;
                  }
                );
            }
        });
         $('#btnplay').click(function() {
            if($('#plList li').length != 0) {
                if(!playing) {
                    $(this).find('span').removeClass('fa-play').addClass('fa-pause');
                    playaudio(index);
                    $('#audio1').get(0).play();
                    playing = true;
                }
                else {
                    $(this).find('span').removeClass('fa-pause').addClass('fa-play');
                    $('#audio1').get(0).pause();
                    playing = false;
                }
            }
            else {
                $.when( refresh("/getmusic", "plFav") ).done(function() {
                        $('#btnplay').find('span').removeClass('fa-play').addClass('fa-pause');
                        playaudio(index);
                        playing = true;
			 setTimeout(function(){ $('#audio1').get(0).play(); }, 500);
                  }
                );
            }

        });

        $("#btnAPlaylist").click(function() {
            if($('#plList li').length != 0  && !isNaN($('#audio1').get(0).duration)) {
               var url = $('#plList li:eq(' + index + ')').attr("url");
               var title = $('#plList li:eq(' + index + ')').find('.plTitle').text();
               var d = $('#audio1').get(0).duration;
               var dmin = parseInt(d/60)+":"+parseInt(d%60);
               console.log(title, url, dmin);
                $.get( "/favmusic",
                   {
                      title: title,
                      link: url,
                      duration: d
                     },
                     function( data, status ) {
                        if(status == 'success') {
                            notify(title+" Added!");
                        }
                });
            }
            else {
                notify("No music to select from!")
            }
        });

        // $('#audio1').get(0).volume = 0.5;
        $("#btnvolume").click(function() {
            var volume = $(this).find("span");
            if(volume.hasClass("fa-volume-off") == true) {
                volume.removeClass("fa-volume-off");
                volume.addClass("fa-volume-up");
                $('#audio1').get(0).muted = false;
            }
            else {
                volume.removeClass("fa-volume-up");
                volume.addClass("fa-volume-off");
                $('#audio1').get(0).muted = true;
            }
        });

    }

    // get audio links from server
    $(document).on ("click", "#reload", function () {
	$("#plList").empty();
	$.when( refresh("/getmusic", "plFav") ).done(function() {
        	refresh("/getaudio", "");
	});
	
    });

    //  show audio list and change the span icon
    $("#showlist").click(function() {
        var span = $(this).find("span");
        if(span.hasClass('fa-chevron-circle-right')) {

            span.removeClass("fa-chevron-circle-right").addClass("fa-chevron-circle-down");
        }
        else {
            span.removeClass("fa-chevron-circle-down").addClass("fa-chevron-circle-right");
        }

        $("#plwrap").toggle();
    });

    // show search input and clear
    $("#musSearch").click(function() {
        $("#showlist").removeClass("col-sm-11").addClass("col-sm-7");
        $("#musicSearch").removeClass("col-sm-1").addClass("col-sm-5");
        $("#sclear").show();
        $("#musicSearch input").show().focus();
    });

    // clearing the input data
    $("#sclear").click(function() {
        $("#musicSearch input").val("");
        $('#plList li').show();
        $("#musicSearch input").focus();
    });

    // launch the keyboard for the audio search input
    $('#msearch').keyboard({
      usePreview: false,
      accepted: function(e, keyboard, el){
            $('#msearch').val(el.value);
            msearch();
          },
      change: function(e, keyboard, el) {
            $('#msearch').val(el.value);
              msearch();
          }
    })
    // activate the typing extension
    .addTyping({
      showTyping: true,
      delay: 250
    });

    /*$("#keyboard").on('keyup', function () {
       console.log($(this).val());
    });*/



});

    // exit the ad video onclick
    $(document).on('click', '#fvideo', function() {
        $(this).get(0).pause();
        /*if (document.exitFullscreen)
            document.exitFullscreen();
        else if (document.webkitExitFullscreen)
            document.webkitExitFullscreen();
        else if (document.mozCancelFullScreen)
            document.mozCancelFullScreen();
        else if (document.msExitFullscreen)
            document.msExitFullscreen();*/
        adsTime += parseFloat($(this).get(0).currentTime);
        $("#adsTime span").text(adsTime);

        $('#mySidenav span').removeClass('active')
        $("#mySidenav span").first().addClass("active");
        $(".mshow").hide();
	$("#menu").show();
        $("#dashboard").show();
    });

    // play the clicked audio li tag
    $(document).on ("click", "#plList li", function () {
    var id = parseInt($(this).index());
    if(playing && index == id) {

    }
    else {
        index = id;
        $('#btnplay span').removeClass('fa-play').addClass('fa-pause');
        $("#plList li .plLength").text("");
        playaudio(index);
        $("#audio1").get(0).play();
        playing = true;
    }

    });

    /* menu
    ==================================================*/
    // show and hide the menu
    $(document).on('click', '#mySidenav span', function() {
	$("#menu").show();
        $('#mySidenav span').removeClass('active')
        $(this).addClass("active");
        $(".mshow").hide();
        var menu = $(this).attr("url");
        $(menu).show();
        $("#menu span").css({"color":"#FBC800", "background-color":"transparent"});

        if(menu == '#music') {
            $("#msearch").hide();
            $("#sclear").hide();
            $("#showlist").removeClass("col-sm-7").addClass("col-sm-11");
            $("#musicSearch").removeClass("col-sm-5").addClass("col-sm-1");
        }
        else if( menu == "#maps") {
            if(mapRef) {
                google.maps.event.trigger(map, 'resize');
                //setTimeout(initMap, 1000);
                map.setCenter(marker.getPosition());
            }
            $("#menu span").css({"color":"#757575", "background-color":"white"});
        }
        else if( menu == "#ads") {
		closeNav();
		$("#menu").hide();
            /*
                video
            ==================================================*/
            // bind to video end
            var vid = document.getElementById("fvideo");
            vid.src = adsTrack[adsCount];
            /*if (vid.requestFullscreen) {
              vid.requestFullscreen();
            } else if (vid.mozRequestFullScreen) {
              vid.mozRequestFullScreen();
            } else if (vid.webkitRequestFullscreen) {
              vid.webkitRequestFullscreen();
            }*/
            vid.play();

	vid.addEventListener("ended", function () {
		adsTime += parseFloat($(this).get(0).duration);
                $("#adsTime span").text(adsTime);
                if(adsCount+1 < adsTrack.length)
                    adsCount++;
                else
                    adsCount = 0;
                vid.src = adsTrack[adsCount];
                vid.preload = "auto";
//setInterval(function(){ vid.play();}, 1000);
                vid.play();

            });
        }
    });


    // hide menu after 5s
    $(document).on('click', 'body', function() {
        if(smenu) {
            window.setTimeout(function() {
                    closeNav();
            }, 5000);
        }
    });

/*
functions
==================================================*/
// function to get video links
function getVideo() {
    var dfrd1 = $.Deferred();
        $.getJSON( "/getads", function( data ) {
            $("#plList").empty();
            for(var i=0; i<data.length; i++) {
                adsTrack[i] = data[i].link;
            }
            dfrd1.resolve();
        });

    return dfrd1.promise();
}
/*============================================*/
// audio search function
function msearch() {
   var str = $("#msearch").val();
    var l = $('#plList li');

   if(str.empty) {
       l.show();
      console.log("show");       }
   else {
       l.hide();
       $.each(l, function( i, v ) {
          var t = $('#plList li:eq('+i+')').find('.plTitle').text();
          if(t.toLowerCase().includes(str.toLowerCase())) {
            $('#plList li:eq('+i+')').show();
          }
    });
   }
}
/*============================================*/
// playing the audio file on index
function playaudio(index) {
    $('.plSel').removeClass('plSel');
    $('#plList li:eq(' + index + ')').addClass('plSel');
    var title = $('#plList li:eq(' + index + ')').find('.plTitle').text();
    $('#npTitle').text(title);
    var player = $("#audio1");
    player.get(0).src = $('#plList li:eq(' + index + ')').attr('url');
}
/*============================================*/
// refreshing the audio lists
function refresh(link, c) {
    var dfrd1 = $.Deferred();
    var trackNumber = 0;
        $.getJSON( link, function( data ) {
            trackCount = data.length;
            for(var i=0; i<data.length; i++) {
                $("#plList").append('<li class="'+c+'" url='+data[i].link+'><div class="plItem"><div class="plNum"><img src="../static/img/icon-playlist-white.svg" width=40px height=25px></div><div class="plTitle">' + data[i].title.replace(/-/g, " ") + '</div><div class="plLength"></div></div></li>');
                trackNumber +=1;
            }
            dfrd1.resolve();
        });

    return dfrd1.promise();
}

/*============================================*/
// format the time
function checkTime(i) {
    return (i < 10) ? "0" + i : i;
}

/*============================================*/
// calculate the audio time
function calculateTime(s, e) {
    var start = parseInt(s/60)+":"+checkTime(parseInt(s%60));
    var end = parseInt(e/60)+":"+checkTime(parseInt(e%60));
    return start+"/"+end;
}

/*============================================*/
// function to display the time in the dashboard
function startTime() {
    var today = new Date(),
        h = checkTime(today.getHours()),
        m = checkTime(today.getMinutes()),
        s = checkTime(today.getSeconds());
	var d = checkTime(today.getDate()) +"/"+ checkTime(today.getMonth()+1) +"/"+today.getFullYear();
    document.getElementById('time').innerHTML = h + ":" + m + ":" + s + "</br>"+ d;
    t = setTimeout(function () {
        startTime()
    }, 500);
}

/*============================================*/
// hide and show the menu
function openNav() {
    document.getElementById("mySidenav").style.width = "25%";
    smenu = true;
}
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    smenu = false;
}

/* =========================================== */

function notify(text) {
    $("#notify span").text(text);
    $("#notify").show();
    setTimeout(function(){ $("#notify").hide(); }, 1500);
}
/* =========================================== */
// check if the browser support canvas tag
function isCanvasSupported(){
  var elem = document.getElementsByTagName('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}


function dashDisplay(data) {
	$("#GaugeMeter_2").gaugeMeter({percent:parseInt(data.speed), used:parseInt(data.speed)});
	$("#signal").text(parseInt(data.gsm));
	$("#status").text(data.status);
}