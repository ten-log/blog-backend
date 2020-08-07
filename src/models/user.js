import mongoose , {Schema} from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const UserSchema = new Schema({
  username: String,
  hashedPassword:String,
})

UserSchema.methods.serialize = function(){
    const data = this.toJSON();
    delete data.hashedPassword;
    return data;
};

UserSchema.methods.setPassword = async function(password) {
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
};

UserSchema.methods.checkPassword = async function(password) {
  const result = await bcrypt.compare(password, this.hashedPassword);
  return result; // true / false
};

UserSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

UserSchema.methods.generateToken = function(){
  const token = jwt.sign(
  //첫번째 파라미터에는 토큰안에 집어넣고 싶은데이터를 넣습니다.
    {
      _id:this.id,  // mongoose 에서는 id를 쓰면 _id의 값을 반환한다고 합니다.
      username:this.username,
    },
    process.env.JWT_SECRET,
    {
        expiresIn:'7d',
    },
  );
  return token;
};

const User = mongoose.model('User', UserSchema);
export default User;
