const user = require('./user');
const page = require('./page');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookSchema = new Schema({
    id: mongoose.Schema.Types.ObjectId,//unique number of page
    pages:[{type:String}],//book contains several pages. pages is the list of page id
    title: {type:String, require:true}, // book title
    author: [{type:String, require:true, default:user.user}],//작가복수 가능
    contents: {type:String}, // book subtitle or detail
    createDate: {type:Date, require:true, default:Date.now},
    updateDate: {type:Date, default:Date.now},
    views: {type: Number, default: 0},//how many people open this book
    favoritenum:{type: Number, default: 0},
    cover:{
      data: {type: Buffer,default:null},
      contentType: {type:String, default:null}
    }, 
    hashtag: [{type: String}],
  });

  
  bookSchema.statics.upload =  async function ({title, author, contents, views, hashtag,cover}) {
    const page = new this({
      title: title,
      author: author,
      contents: contents,
      views: views,
      hashtag:hashtag,
    });
    await page.save(function(err){
      if(err) return console.error(err);
    });
    return page;
  };
  

  bookSchema.statics.ListofPage = async function () {
    var book = this;
    var pages = await page.find({"_id": book.ObjectId});
    return pages;
};

  bookSchema.statics.findBySearchWord = async function (word) {
    var book = this;
    const reg = new RegExp(word, 'i');
    var result = []
    var books=await book.find();
  
    await books.map(obj => {
      // obj.hashtag.inclues
      if (obj.title.match(reg)) {  //제목에 검색어가 들어가는가
        temp = new Object();
        temp.url = obj.url;
        temp.image = obj.image;
        temp.title = obj.title;
        temp.author = obj.author;
        result.push(temp);
        delete temp;
      }
      else if (obj.contents.match(reg))
      {
        temp = new Object();
        temp.url = obj.url;
        temp.image = obj.image;
        temp.title = obj.title;
        temp.author = obj.author;
        result.push(temp);
        delete temp;
      }
      else {
        for (let i = 0; i < obj.hashtag.length; i++) 
        {
          if (obj.hashtag[i].match(reg)) { //hashtag에 검색어가 들어가는가
            temp = new Object();
            temp.url = obj.url;
            temp.image = obj.image;
            temp.title = obj.title;
            temp.author = obj.author;
            result.push(temp);
            delete temp;
            break
          }
        }
      }
    })
  
    return result
  }

  bookSchema.methods.updateB = async function (book) {
    this.title = book.title;
    this.author = book.author;
    this.contents = book.contents;
    this.author = book.author;
    if(book.cover != ""){
      this.cover = [];
      //this.cover.push(book.cover);
    }
    this.save();
  };



module.exports = mongoose.model("Book", bookSchema);