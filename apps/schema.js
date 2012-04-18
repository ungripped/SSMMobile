var mongoose 	= require('mongoose'),
	Schema		= mongoose.Schema,
	ObjectId 	= Schema.ObjectId;

var Article = new Schema({
	namn: String,
	kategori: String,
	nyckel: Number,
	bild: String,
	sasong: [],
	s1: String,
	thumb: String
});

var ArticleList = new Schema({
	date: Date,
	title: String,
	list: [Article]
});

// This looks exactly like Article, but might change soon, 
// therefore it gets its own Schema.
var Recipe = new Schema({
	namn: String,
	kategori: String,
	nyckel: Number,
	bild: String,
	sasong: [],
	s1: String,
	thumb: String
});
var RecipeList = new Schema({
	date: Date,
	title: String,
	list: [Recipe]
});

mongoose.model('ArticleList', ArticleList);
mongoose.model('Article', Article);
mongoose.model('RecipeList', RecipeList);
mongoose.model('Recipe', Recipe);

/*
 article JSON:
{
	"namn":"Kastanj",
	"kategori":"Nötter",
	"nyckel":43,
	"bild":"Fil:Chestnut03.jpg",
	"sasong": {
		"manad-1":0,
		"manad-2":0,
		"manad-3":0,
		"manad-4":0,
		"manad-5":0,
		"manad-6":0,
		"manad-7":0,
		"manad-8":0,
		"manad-9":0,
		"manad-10":21,
		"manad-11":0,
		"manad-12":0
	},
	"s1":"000000000200.png",
	"thumb":"http://xn--ssongsmat-v2a.nu/w/images/thumb/9/94/Chestnut03.jpg/120px-Chestnut03.jpg"
}

recipe JSON:
{
  "namn": "Recept:Kastanjekroketter",
  "kategori": "Förrätter_och_smårätter",
  "nyckel": 43,
  "sasong": {
    "manad-1": 0,
    "manad-2": 0,
    "manad-3": 0,
    "manad-4": 0,
    "manad-5": 0,
    "manad-6": 0,
    "manad-7": 0,
    "manad-8": 0,
    "manad-9": 0,
    "manad-10": 21,
    "manad-11": 0,
    "manad-12": 0
  },
  "s1": "000000000200.png"
}
*/
