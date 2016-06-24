package objects;

public class Uv {
	private String code;
	private String name;
	private String description;
	private String url;
	
	public Uv(String code, String name, String description){
		this.code			= code;
		this.name			= name;
		this.description	= description;
	}
	
	public Uv(String code, String name, String description, String url){
		this.code			= code;
		this.name			= name;
		this.description 	= description;
		this.url			= url;
	}
	
	public String getCode(){
		return code;
	}
	
	public String getName(){
		return name;
	}

	public String getDescritpion(){
		return description;
	}
	
	public String getUrl(){
		return url;
	}
	
	public void setDescritpion(String description){
		this.description = description;
	}
}
