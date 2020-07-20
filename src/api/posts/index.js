import Router from 'koa-router';
import *as postsCtrl from './posts.ctrl';


const posts = new Router(); //라우터 설정

posts.get('/' , postsCtrl.list );
posts.post('/' , postsCtrl.write);
posts.get('/:id' , postsCtrl.read);
posts.delete('/:id' , postsCtrl.remove);
//posts.put('/:id', postsCtrl.replace);   책에서 안쓴다고함 
posts.patch('/:id', postsCtrl.update);

export default posts;
