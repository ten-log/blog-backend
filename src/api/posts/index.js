import Router from 'koa-router';
import *as postsCtrl from './posts.ctrl';
import checkLoggedIn from '../../lib/jwtMiddleware';

const posts = new Router(); //라우터 설정

posts.get('/' , postsCtrl.list );
posts.post('/' , checkLoggedIn, postsCtrl.write);

const post = new Router(); //라우터 설정을 왜 2번 한지 모르겠음
//posts.put('/:id', postsCtrl.replace);   책에서 안쓴다고함 덮어쓰기개념임

post.get('/'  , postsCtrl.read);
post.delete('/' , checkLoggedIn, postsCtrl.checkOwnPost , postsCtrl.remove);
post.patch('/',  checkLoggedIn , postsCtrl.checkOwnPost  ,postsCtrl.update);

posts.use('/:id', postsCtrl.getPostById, post.routes());

export default posts;
