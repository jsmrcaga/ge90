package main;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import objects.Uv;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class Main {
	private static HashMap<String, Uv> 	uvs;
	private static Document doc;
	private static String url;
	
	// Main function
	public static void main (String[] args){
		url = "https://ntst.umd.edu/soc/201601/CMSC";
		//deleteDB();
		
		getPage(true, "");
		parsePage(true, null);
	    
		insertDB();
	    System.err.println("Program Done");
	}

	private static void getPage(boolean web, String url2) {
		
		try {
			if(web){
				System.err.println("web file");
				doc = Jsoup.connect(url + url2).get();
			}
			else{
				System.err.println("local file");
				File input = new File("uv.html");
				//File input = new File("C:/Users/antoine/Downloads/ecole/uv.html");
				doc = Jsoup.parse(input, "UTF-8", "");
			}
			
			//System.err.println(doc);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	private static void parsePage(boolean main, Uv u) {
		Elements tmp;
		Element tmp2;
		String code;
		String name;
		String description = "";
		String url = "";
		String id;
		String id2;
		Pattern p = Pattern.compile("\\((.*?)\\(",Pattern.DOTALL);
		Pattern p2 = Pattern.compile("^[^-,]*",Pattern.DOTALL);
		int i = 1;
		
		if(main){
			uvs = new HashMap<String, Uv>();

			Elements all_uv = doc.getElementsByAttributeValue("class", "course");
			//all_uv = all_uv.get(0).getElementsByTag("tr");
			//Elements all_desc = doc.getElementsByAttributeValue("class","moredetailcontent");
			System.err.println(all_uv.size() + " uvs");
						
			for(Element uv: all_uv){
				if(i != 0){
					code = null;
					name = null;
					description = null;
					
					//System.err.println(uv);
					
					tmp = uv.getElementsByAttributeValue("class", "course-id");
					//Code
					//tmp = uv.getElementsByAttributeValue("class", "course_title");
					code = tmp.first().text();
					//code = code.substring(0, 7) + code.substring(8);
					
					/*Matcher matcher = p.matcher(code);
					while(matcher.find())
					{
					    code = matcher.group(1);
					}*/

					//name = code.split("-")[1];
					//code = code.split("-")[0];

					code = code.replaceAll("\\s","");
					code = code.replaceAll("[^a-zA-Z0-9]+","");
					//System.err.println(code);
					//System.err.println(name);
					/*if(code.length() > 15){
						String [] tmp3 = code.split("-");
						code = tmp3[0];
					}*/
					
					//Name
					tmp = uv.getElementsByAttributeValue("class", "course-title");
					name = tmp.first().text();
					//name = name.split(":")[1];
									
					//System.err.println(name);
					//Url
					//if(tmp.get(1).getElementsByTag("a").first() != null){
						//url = tmp.get(1).getElementsByTag("a").first().attr("href");
//						url = url.split(",")[2];
//						url = url.replaceAll("\\s","");
//						url = url.replaceAll("'","");
						
						//System.err.println("URL : " + url);
						
						//Description
						//tmp = uv.getElementsByAttributeValue("class", "catalogue");
						
						//id = uv.id();
						//id = id.substring(11);
						
						/*for(Element desc: all_desc){
							id2 = desc.id();
							id2 = id2.substring(14);
							//System.err.println("ID2 : " + id2);
			
							if(Integer.parseInt(id) == Integer.parseInt(id2)){
								tmp2 = desc.getElementById("srl_description");
								if(tmp2 != null){
									description = tmp2.text();
								}
							}
						}*/
						
						tmp = uv.getElementsByAttributeValue("class", "approved-course-text");
						if(tmp.size() > 1)
							description = tmp.get(1).text();
						//System.err.println(description);
							
					//}
					uvs.put(code, new Uv(code, name, description, ""));
				}
				i++;
			}
			/*Set<String> cles = uvs.keySet();
			Iterator it = cles.iterator();
			while (it.hasNext()){
			   Object cle = it.next(); // tu peux typer plus finement ici
			   Uv u2 = uvs.get(cle); // tu peux typer plus finement ici
			   
			   System.err.println(cle);
			   
			   getPage(true, u2.getUrl());
			   parsePage(false, u2);
			}*/
		}
		else{
			//System.err.println(doc);
			Elements tmp4 = doc.getElementsByAttributeValue("class", "block_content_outer");
			Element tmp5 = tmp4.get(0);
			
			tmp5.getElementsByTag("table").get(1).remove();
			tmp5 = tmp5.getElementsByAttributeValue("class", "block_content").first();
			tmp5.getElementsByTag("div").remove();
			tmp5.getElementsByTag("h1").remove();
			tmp5.getElementsByTag("a").remove();
			tmp5.getElementsByTag("p").remove();
			tmp5.getElementsByTag("span").remove();
			
			description = tmp5.text();
			
			//System.err.println(description);
			u.setDescritpion(description);
			uvs.put(u.getCode(), u);
		}
		System.err.println("Parse Done");
	}
	
	private static void deleteDB() {
		try {
			Connection connexion = DriverManager.getConnection("jdbc:mysql://localhost/ge90","root","");
			
			// the mysql insert statement
		     String query = "Delete from uvs where 1";
		 
	     	// create the mysql insert preparedstatement
		    PreparedStatement preparedStmt = connexion.prepareStatement(query);
		    preparedStmt.execute();

		    System.err.println("Delete Database done");
		       
		    connexion.close();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}		
	}

	private static void insertDB() {
		try {
			Connection connexion = DriverManager.getConnection("jdbc:mysql://localhost/ge90","root","");
			
			// the mysql insert statement
		     String query = " insert into uvs (UV_university, UV_code, UV_name, UV_description)"
		        + " values (16, ?, ?, ?) ON DUPLICATE KEY UPDATE UV_name=?, UV_description=?";
		 
	     	// create the mysql insert preparedstatement
		    PreparedStatement preparedStmt = connexion.prepareStatement(query);
		    
		    for(String idx : uvs.keySet()){
			    preparedStmt.setString (1, uvs.get(idx).getCode());
			    preparedStmt.setString (2, uvs.get(idx).getName());
			    preparedStmt.setString (3, uvs.get(idx).getDescritpion());
			    
			    preparedStmt.setString (4, uvs.get(idx).getName());
			    preparedStmt.setString (5, uvs.get(idx).getDescritpion());
			 
			    // execute the preparedstatement
			    preparedStmt.execute();
		    }
		    
		    System.err.println("Insert Database done");
		       
		    connexion.close();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}		
	}
}
