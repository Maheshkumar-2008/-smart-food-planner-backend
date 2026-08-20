                                           

create database Hotel_Management

create table Hotel
(
 Hol_ID          char(20)    primary key,
 Hol_Name        char(30),
 Hol_Address     varchar(50),
 Hol_Contact     bigint,
 Hol_Rating      float,
 Hol_Type        char(50)

 )    
 insert into Hotel values('101','ram','Tiruchanoor Road',6003545522,4.5,'Veg')
 insert into Hotel values('102','AMD','KT Road',6003545535,3.5,'Veg')
 insert into Hotel values('103','Orange','Nandi circle',6003640022,4.5,'Veg')
 insert into Hotel values('104','VR','Dr Mahal Road',6003025422,3.5,'Non Veg')
 insert into Hotel values('105','RK','VV mahal Road',6003540922,3.0,'Non Veg')
 insert into Hotel values('106','Taj','Tiruchanoor Road',6003455224,6.0,'Veg and Non Veg')



 create table Food(
 Fd_Id     int       primary key, 
 Fd_Name   char(30)  unique,
 Fd_Type   char(20),
 Quantity    int,
 Fd_Price  int

 )
 insert into Food values(301,'Sada Dosa','Veg',3,40)
 insert into Food values(302,'Pongal','Veg',2,50)
 insert into Food values(303,'North Indian Meals','Veg',1,90)
 insert into Food values(304,'South Indian Meals','Veg',1,90)
 insert into Food values(305,'Masala Dosa','Veg',1,50)
 insert into Food values(306,'Idly','Veg',4,30)
 insert into Food values(307,'Puri','Veg',2,50)
 insert into Food values(308,'Gobi fried rice','Veg',1,90)
 insert into Food values(309,'Veg fried rice','Veg',1,399)
 insert into Food values(310,'Pizza','Non veg',1,100)
 insert into Food values(311,'Burger','Non veg',1,100)

 create table Customer

 (
 Cust_Id       int           primary key,
 Cust_Mobile   bigint,
 Cust_Email    varchar(50),
 Cust_Address  varchar(50),
 Cust_Name     char(20),
 Ord_Food      char(30)      foreign key(Ord_Food) references Food(Fd_Name)

 )
 insert into Customer values(50001,9876543000,'ram01@gmail.com','Bhavani Nagar','Ram','Sada Dosa')
 insert into Customer values(50002,9876543001,'mahi2@gmail.com','KT Road','Krishna','Pongal')
 insert into Customer values(50003,9876543002,'shiva@gmail.com','Korlagunta','Shiva','North Indian Meals')
 insert into Customer values(50004,9876543003,'hemanth@gmail.com','Korlagunta','Parvathi','South Indian Meals')
 insert into Customer values(50005,9876543004,'nikhil@gmail.com','Bhavani Nagar','Sita','Masala Dosa')
 insert into Customer values(50006,9876543005,'somu01@gmail.com','Korlagunta','Vinayaka','Idly')
 insert into Customer values(50007,9876543006,'bhargav7@gmail.com','TK street','Kamakshi','Puri')
 insert into Customer values(50008,9876543007,'baby@gmail.com','Gandhi Road','Vishnu','Gobi fried rice')
 insert into Customer values(50009,9876543008,'anuradha116@gmail.com','Gandhi road','Lakshmi','Veg fried rice')
 insert into Customer values(50010,9876543009,'dinesh0@gmail.com','Balaji Colony','Dakshinamurthy','Pizza')
 

 
 create table Payment(
 Py_Id             int        primary key,
 Amount                 int,
 Py_Type           char(20),
 Dis_Percent       int,
 Py_Date           Date

 )
 insert into Payment values(501,200,'Cash',12,'2026-07-16')
 insert into Payment values(502,280,'UPI',12,'2026-08-16')
 insert into Payment values(503,220,'Cash',10,'2026-09-16')
 insert into Payment values(504,180,'UPI',8,'2026-08-16')
 insert into Payment values(505,100,'Cash',5,'2026-07-16')
 insert into Payment values(506,300,'Card',12,'2026-08-16')
 insert into Payment values(507,150,'UPI',8,'2026-09-16')
 insert into Payment values(508,230,'UPI',12,'2026-08-16')
 insert into Payment values(509,200,'Card',12,'2026-09-16')
 insert into Payment values(510,210,'Cash',12,'2026-08-16')



 create table Staff(
 Staff_Id     int         primary key,
 Staff_name   char(20),
 Staff_Type   char(20),
 Rating       float,
 Salary       int

 )
 insert into Staff values(161,'Stalin','Cashier',2.5,35000)
 insert into Staff values(162,'Babu','Server',2.0,30000)
 insert into Staff values(163,'Gopinath','Chef',4.0,80000)
 insert into Staff values(164,'Sandeep','Assistant Manager',3.5,75000)
 insert into Staff values(165,'Satwik','Manager',4.0,90000)
 


 update Hotel set Hol_Address='Air Bypass Road' where Hol_ID=101
 update Hotel set Hol_Rating=4.5 where Hol_Name='Taj'
 update Customer set Cust_Address='TK Street' where Cust_Name='Ram'
 update Customer set Cust_Email='ramsita55@gmail.com' where Cust_Name='Ram'
 update Payment set Dis_Percent=15 where Py_ID=501
 update Payment set Dis_Percent=15 where Py_ID=502
 update Food set Fd_Type='Fast Food' where Fd_Name='Pizza'
 delete from Payment where Py_ID=505 and Py_Type='Cash'
 delete from Food where Fd_Name='Burger'
 delete from Staff where Staff_Name='Babu' and Rating=2
 update Hotel set Hol_Type='Veg' where Hol_Name='Vivaha Bhojanambu'

 update Food set Quantity=10 where Fd_Id=305 or Fd_Price=399

select * from Hotel
select * from Food
select * from Customer
select * from Payment
select * from Staff

