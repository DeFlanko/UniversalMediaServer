package net.pms.remote;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import net.pms.configuration.RendererConfiguration;
import net.pms.dlna.DLNAResource;
import net.pms.dlna.RootFolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RemotePlayHandler implements HttpHandler {
	private static final Logger LOGGER = LoggerFactory.getLogger(RemotePlayHandler.class);
	private final static String CRLF = "\r\n";
	private RemoteWeb parent;

	public RemotePlayHandler(RemoteWeb parent) {
		this.parent = parent;
	}

	private String mkPage(String id, HttpExchange t) throws IOException {
		LOGGER.debug("make play page " + id);
		RootFolder root = parent.getRoot(t.getPrincipal().getUsername());
		if (root == null) {
			throw new IOException("Unknown root");
		}
		String id1 = id;
		/*int pos = id.lastIndexOf(".");
		 if(pos != -1)
		 id1 = id.substring(0, pos);*/
		StringBuilder sb = new StringBuilder();
		List<DLNAResource> res = root.getDLNAResources(id, false, 0, 0, root.getDefaultRenderer());
//		sb.append("<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:og=\"http://opengraphprotocol.org/schema/\">");
		sb.append("<!DOCTYPE html>");
		sb.append(CRLF);
		sb.append("<head>");
		sb.append("<link rel=\"stylesheet\" href=\"");
		sb.append("http://swesub.nu/css/style.css");
		sb.append("\">");
		/*sb.append("<script type='text/javascript' ");
		 //sb.append("src=\"/files/flowplayer.js\">");
		 //sb.append("src=\"http://www.longtailvideo.com/jwplayer/jwplayer.js\">");
		 sb.append("</script>");*/
        /*sb.append("<script src=\"//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js\"></script>");
       // sb.append("<script src=\"//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js\"></script>");
        //<!-- 2. flowplayer -->
        sb.append("<script src=\"//releases.flowplayer.org/5.4.3/flowplayer.min.js\"></script>");

        //<!-- 3. skin -->
        sb.append("<link rel=\"stylesheet\" href=\"//releases.flowplayer.org/5.4.3/skin/minimalist.css\">");*/
		sb.append("</head>");
		sb.append("<body>");
      /*  sb.append("<div class=\"flowplayer\" data-engine=\"flash\">");
        sb.append("<video>");
        sb.append("<source type=\"video/flash\" src=\"/media/");
        sb.append(id1).append("\">");
        sb.append("</video></div>");*/
		/*String x="<script type=\"text/javascript\" src=\"/jwplayer/jwplayer.js\"></script>"+
		 "<video class=\"jwplayer\" src=\"";
		 sb.append(x+"/media/"+id1+"\"></video>");*/
		/*		sb.append("<script type='text/javascript'>");
		 sb.append(CRLF);
		 sb.append("jwplayer('container').setup({");
		 sb.append("'flashplayer': 'player.swf',");
		 //sb.append("'flashplayer': 'http://player.longtailvideo.com/player.swf',");
		 sb.append(CRLF);
		 sb.append("'file': '/media/" + id1 + "',");
		 sb.append(CRLF);
		 sb.append("'controlbar': 'bottom',");
		 //sb.append("'autostart' : true");
		 sb.append("'height': 270,");
		 sb.append(CRLF);
		 sb.append("'width': 480");
		 sb.append(CRLF);
		 sb.append(")});");
		 sb.append(CRLF);
		 sb.append("</script>");
		 sb.append(CRLF);
		 sb.append("<div id='container'>Loading player....</div><br>");*/
		//sb.append("<br><ul><li onclick='jwplayer().play()'>Start the player</li></ul><br>");
		String mime = root.getDefaultRenderer().getMimeType(res.get(0).mimeType());
		String mediaType = "";
		if (res.get(0).getFormat().isAudio()) {
			mediaType = "audio";
			String thumb = "/thumb/" + id1;
			sb.append("<img class=\"cover\" src=\"").append(thumb).append("\" alt=\"\" /><br>");
		}

		if(res.get(0).getFormat().isVideo()) {
			mediaType="video";
			mime="video/mpeg4";
		}
		sb.append("<").append(mediaType).append(" width=\"640\" height=\"360\" controls=\"controls\" autoplay=\"autoplay\"");
		sb.append(" src=\"/media/").append(id1).append("\" type=\"").append(mime).append("\">");
		sb.append("Your browser doesn't appear to support the HTML5 video tag");
		sb.append("</").append(mediaType).append("><br><br>");
		List<DLNAResource> res1 = root.getDLNAResources(id, false, 0, 0, RendererConfiguration.getDefaultConf());
		String rawId = id ;//+ "." + res1.get(0).getFormat().getMatchedId();
		sb.append("<a href=\"/raw/").append(rawId).append("\" target=\"_blank\">Download</a>");
		sb.append(CRLF);
		/*String emb = "<OBJECT ID=\"MediaPlayer1\" CLASSID=\"CLSID:22d6f312-b0f6-11d0-94ab-0080c74c7e95\" CODEBASE=\"http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab# Version=5,1,52,701\" STANDBY=\"Loading Microsoft Windows Media Player components...\" TYPE=\"application/x-oleobject\" width=\"320\" height=\"280\">"+
		 "<param name=\"fileName\" value=\"/raw/" + rawId + "\">"+
		 "<param name=\"animationatStart\" value=\"true\">"+
		 "<param name=\"transparentatStart\" value=\"true\">"+
		 "<param name=\"autoStart\" value=\"false\">"+
		 "<param name=\"showControls\" value=\"true\">"+
		 "<param name=\"Volume\" value=\"-300\">"+
		 "<embed type=\"application/x-mplayer2\" pluginspage=\"http://www.microsoft.com/Windows/MediaPlayer/\" src=\"/raw/" + rawId + "\" name=\"MediaPlayer1\" width=320 height=280 autostart=0 showcontrols=0 volume=-300>"+
		 "</OBJECT>"; 
		 sb.append(emb);*/
		sb.append("</body></html>");
		return sb.toString();
	}

	@Override
	public void handle(HttpExchange t) throws IOException {
		LOGGER.debug("got a play equest " + t.getRequestURI());
		if (RemoteUtil.deny(t)) {
			throw new IOException("Access denied");
		}
		String id;
		id = RemoteUtil.getId("play/", t);
		String response = mkPage(id, t);
		LOGGER.debug("play page " + response);
		t.sendResponseHeaders(200, response.length());
		try (OutputStream os = t.getResponseBody()) {
			os.write(response.getBytes());
		}
	}
}
