import Router from 'koa-router';
import *as postsCtrl from './posts.ctrl';
import checkLoggedIn from '../../lib/jwtMiddleware';

const posts = new Router(); //라우터 설정

posts.get('/' , postsCtrl.list );
posts.post('/' , checkLoggedIn, postsCtrl.write);

const post = new Router(); //라우터 설정
post.get('/:id' , postsCtrl.checkObjectId , postsCtrl.read);
post.delete('/:id' , postsCtrl.checkObjectId , postsCtrl.remove);
//posts.put('/:id', postsCtrl.replace);   책에서 안쓴다고함
post.patch('/:id',  postsCtrl.checkObjectId ,postsCtrl.update);

export default posts;
