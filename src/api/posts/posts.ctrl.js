import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from '@hapi/joi';

const {ObjectId} = mongoose.Types;  //몽고디비 타입 맞나 안맞나 확인용

export const checkObjectId =(ctx,next)=>{
  const {id} = ctx.params;
  if(!ObjectId.isValid(id)){  // 여기서 이 함수가 id맞나 안맞나 판단함
    ctx.status = 400;
    return;
  }
  return next();
};

let postId = 1; // id의 초깃값입니다.
// posts 배열 초기 데이터
const posts = [
  {
    id: 1,
    title: '제목',
    body: '내용',
    tags:['태그1', '태그2']
  },
];

/* 포스트 작성
POST /api/posts
{ title, body }
*/
export const write = async ctx => {

  const schema = Joi.object().keys({
    title:Joi.string().required(), //required 가있으면 필수항목
    body:Joi.string().required(),
    tags: Joi.array()
    .items(Joi.string()).required()
  })
  const result =schema.validate(ctx.request.body);
  if(result.error){
    ctx.status = 400;
    ctx.body= result.error;
    return;
  }


  // REST API의 request body는 ctx.request.body에서 조회할 수 있습니다.
  const { title, body , tags} = ctx.request.body;
  const post = new Post({
    title, body, tags , user:ctx.state.user,
  });
  try {
    await post.save();
    ctx.body = post;
  }catch(e){
    ctx.throw(500, e);
  }
}
/*
export const write =  ctx => {
  // REST API의 request body는 ctx.request.body에서 조회할 수 있습니다.
  const { title, body } = ctx.request.body;
  postId += 1; // 기존 postId 값에 1을 더합니다.
  const post = { id: postId, title, body };
  posts.push(post);
  ctx.body = post;
};*/

/* 포스트 목록 조회
GET /api/posts
*/
export const list = async ctx => {
  const page = parseInt(ctx.query.page || '1', 10);

  if(page < 1){
    ctx.status = 400;
    return;
  }
  try{
    const posts = await Post.find().sort({_id:-1}).limit(10).skip((page-1)*10).exec();
    const postCount = await Post.countDocuments().exec();
    ctx.set('Last-Page' , Math.ceil(postCount/10));


    ctx.body = posts
                .map(post =>post.toJSON())
                .map(post =>({
                  ...post,
                  body: post.body.length <100 ? post.body: `${post.body.slice(0,100)}...`,
                }));
  }catch(e){
    ctx.throw(500, e);
  }
};

/* 특정 포스트 조회
GET /api/posts/:id
*/
export const read = async ctx => {
  const { id } = ctx.params;
  // 주어진 id 값으로 포스트를 찾습니다.
  // 파라미터로 받아 온 값은 문자열 형식이니 파라미터를 숫자로 변환하거나,
  // 비교할 p.id 값을 문자열로 변경해야 합니다.
  try{
    const post = await Post.findById(id).exec();
    if(!post){
      ctx.status=404;
      return;
    }
    ctx.body= post;
  }catch(e){
    ctx.throw(500, e);
  }
};

/* 특정 포스트 제거
DELETE /api/posts/:id
*/
export const remove = async ctx =>{
  const {id} = ctx.params;
  try{
    await Post.findByIdAndRemove(id).exec();
    ctx.status=204;
  }catch(e){
    ctx.throw(500, e);
  }
}
/*
export const remove = ctx => {
  const { id } = ctx.params;
  // 해당 id를 가진 post가 몇 번째인지 확인합니다.
  const index = posts.findIndex(p => p.id.toString() === id);
  // 포스트가 없으면 오류를 반환합니다.
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: '포스트가 존재하지 않습니다.',
    };
    return;
  }
  // index번째 아이템을 제거합니다.
  posts.splice(index, 1);
  ctx.status = 204; // No Content
};*/

/* 포스트 수정(교체)                          put은 책에서 안쓴다함
PUT /api/posts/:id
{ title, body }
*//*
export const replace = ctx => {
  // PUT 메서드는 전체 포스트 정보를 입력하여 데이터를 통째로 교체할 때 사용합니다.
  const { id } = ctx.params;
  // 해당 id를 가진 post가 몇 번째인지 확인합니다.
  const index = posts.findIndex(p => p.id.toString() === id);
  // 포스트가 없으면 오류를 반환합니다.
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: '포스트가 존재하지 않습니다.',
    };
    return;
  }
  // 전체 객체를 덮어씌웁니다.
  // 따라서 id를 제외한 기존 정보를 날리고, 객체를 새로 만듭니다.
  posts[index] = {
    id,
    ...ctx.request.body,
  };
  ctx.body = posts[index];
};*/

/* 포스트 수정(특정 필드 변경)
PATCH /api/posts/:id
{ title, body }
*/
export const update = async ctx =>{

  const {id} = ctx.params;

  const schema = Joi.object().keys({
    title:Joi.string(),
    body:Joi.string(),
    tags: Joi.array()
    .items(Joi.string())
  })
  const result =schema.validate(ctx.request.body);
  if(result.error){
    ctx.status = 400;
    ctx.body= result.error;
    return;
  }

  try{
    const post = await Post.findByIdAndUpdate(id, ctx.request.body ,{new:true}
    ).exec();
    if(!post){
      ctx.status =404;
      return;
    }
    ctx.body= post;
  }catch(e){
    ctx.throw(500, e);
  }
}
/*
export const update = ctx => {
  // PATCH 메서드는 주어진 필드만 교체합니다.
  const { id } = ctx.params;
  // 해당 id를 가진 post가 몇 번째인지 확인합니다.
  const index = posts.findIndex(p => p.id.toString() === id);
  // 포스트가 없으면 오류를 반환합니다.
  if(index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: '포스트가 존재하지 않습니다.',
    };
    return;
  }
  // 기존 값에 정보를 덮어씌웁니다.
  posts[index] = {
    ...posts[index],
    ...ctx.request.body,
  };
  ctx.body = posts[index];
};*/
