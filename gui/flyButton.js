$(function() 
{
	 $("#flyButton")
       .text("") // sets text to empty
	.css(
	{ "z-index":"2",
	  "background":"rgba(0,0,0,0)", "opacity":"0.9", 
	  "position":"absolute", "top":"4px", "left":"38px"
	}) // adds CSS
    .append("<img width='32' height='32' src='images/icon-fly.png'/>")
    .button()
	.click( 
		function() 
		{ 
			setFlyMode(!flyMode);
		});
});