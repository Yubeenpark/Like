const user = require('./user');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const PageSchema = new Schema({
    id: mongoose.Schema.Types.ObjectId,//unique number of page
    book:[{type:mongoose.Schema.Types.ObjectId, ref:'book', required:false}],//book contains several pages 
    title: {type:String, require:true}, // title of post
    author: [{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true}], 
    contents: {type:String}, // contents of page
    createDate: {type:Date, require:true, default:Date.now},
    updateDate: {type:Date, default:Date.now},
    views: {type: Number, default: 0},//how many people open this page
    cover:{
      data: {type: Buffer,default:null},
      contentType: {type:String, default:null}
    }, 
    hashtag: [{type: String}],
    comment: { 
      writer: {type: String},
      contents: {type:String},  //comment text
      createDate: {type:Date, require:true, default:Date.now},
      updateDate: {type:Date, default:Date.now},
      
    },
  });


  PageSchema.statics.updateP =  async function ({title, author, contents, hashtag,book,cover}) {
  
    const page = new this({
      title: title,
      book: book,//book으로 들어와서 생성한 경우, 그 book의 id를 넘겨주기
      author: author,
      contents: contents,
      hashtag:hashtag,
      cover:cover
  
    });
    await page.save(function(err){
      if(err) return console.error(err);
    });
    return page;
  };
  

  // parameters: search word
  PageSchema.statics.findBySearchWord = async function (word) {
    var page = this;
    const reg = new RegExp(word, 'i');
    var result = []
    var pages = await page.find();
  
    console.log(petType)
    await pages.map(obj => {
      // obj.hashtag.inclues
      if (obj.title.match(reg)) {  //제목에 검색어가 들어가는가
        temp = new Object();
        temp.url = obj.url;
        temp.cover = obj.cover;
        temp.title = obj.title;
        temp.author = obj.author;
        result.push(temp);
        delete temp;
      }
      else {
        for (let i = 0; i < obj.hashtag.length; i++) {
          if (obj.hashtag[i].match(reg)) { //hashtag에 검색어가 들어가는가
            temp = new Object();
            temp.url = obj.url;
            temp.cover = obj.cover;
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

  // parameters: user's favorites page list
  PageSchema.statics.favoriteRecipe = async function (pageUrlArr) {
    var pgList = []
    for(let i=0; i<pageUrlArr.length; i++) {
      const page = await this.findOne({ url: pageUrlArr[i] }).exec();
  
      temp = new Object();
      temp.url = page.url;
      temp.title = page.title;
      temp.cover = page.cover;
      pgList.push(temp);
      delete temp;
    }
    
    return pgList;
  }

module.exports = mongoose.model("Page", PageSchema);