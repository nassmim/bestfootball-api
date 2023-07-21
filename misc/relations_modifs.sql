
/*create table challenge_bf_test as
select c.id, c.user_id, c.challenge_id, v.name, c.score, c.success,
c.checked, v.view, v.like, v.notes, v.bf_path, v.thumdnail_path as 'thumbnail_path',
v.cdn_path, v.enable, c.created_at, c.updated_at,
v.deleted_at   
from challenge_bf c
left join video v
on v.id=c.video_id;
quit;*/

/*create table challenge_test as
select c.id, v.name, c.description, c.challenge_type_id, c.challenge_category_id,
v.bf_path, v.thumdnail_path as 'thumbnail_path', v.cdn_path,
c.created_at, c.updated_at, v.deleted_at   
from challenge c
left join video v
on c.id=v.challenge_id;
quit;*/

/*create table `earning` as
select e.id, e.user_id, e.challenge_id, c.video_id, e.point, 
e.footcoin, e.origin, e.created_at, e.updated_at
from earning e
left join challenge_bf c
on e.id=c.video_id and e.created_at=c.created_at ;
quit;*/

/*create table address_test as
select a.*, c.id as city_id 
from address a
left join city c
on a.zip_code=c.zip_code;
quit;*/

/*create table challenge_bf_test as
select c.id, c.challenge_id, c.name, c.score, c.success,
c.checked, c.view, c.like, c.notes, c.bf_path, c.thumbnail_path,
c.cdn_path, c.enable, c.created_at, c.updated_at,
v.user_id as 'player_id'
from challenge_bf c
left join challenge_bf_0 v
on c.id=v.id;
quit;*/

/*create table player_test as
select p.*, u.id as 'user_id'
from player p
left join user u
on p.id=u.id;
quit;*/

/*create table challenge_bf_test as
select c.*, p.user_id as 'user_id'
from challenge_bf c
left join player p
on c.player_id=p.id;
quit;*/

create table challenge_bf_test as
select c.*, p.challenge_category_id as 'challenge_category_id'
from challenge_bf c
left join challenge p
on c.challenge_id=p.id;
quit;
