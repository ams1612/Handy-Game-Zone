 
        

// //Prototype-based Inheritance

// const student = {
//     name: "John",
//     age: 20,
//     salary: 5000,
//     greet: function() {
//         console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
//     }
// }

// const Alice = {
//     name: "Alice",
//     age: 30,
//     salary: 7000,
//     greet: function() {
//         console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
//     },
//   };

//   const Alice3 = {
//     name: "Alice3",
//     age: 30,
//     salary: 7000,
//     greet: function() {
//         console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
//     },
//   };

//   const Alice1 = {
//     name: "Alice1",
//     age: 30,
//     salary: 7000,
//     greet: function() {
//         console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
//     },
//   };

//   const Alice2 = {
//     name: "Alice2",
//     age: 30,
//     salary: 7000,
//     greet: function() {
//         console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
//     },

//     calcTax () {
//       console.log("tax rate is 20%");
//     },
//   };

//   const employee = {
//     calcTax () {
//       console.log("tax rate is 10%");
//     },
//   };

//   Alice.__proto__ = employee;
//   Alice1.__proto__ = employee;
//   Alice2.__proto__ = employee;
//   Alice3.__proto__ = employee;

//   // Class-based Inheritance

//   class ToyotaCar {

//     constructor(brand, mileage) {
//       this.brand = brand;
//       this.mileage = mileage;
//     }

//     start() {
//       console.log("Toyota car is starting...");
//     }

//     stop() {
//       console.log("Toyota car is stopping...");
//     } 

//     setBrand(brand) {
//       this.brand = brand;
//     }
//   }

//   let fortuner = new ToyotaCar("fortuner", 10);
//   let innova = new ToyotaCar("innova", 15);

//   // Inheritance
//   class Parent {
//     hello() {
//       console.log("Hello from Parent class!");
//     }

//   }

//   class Child extends Parent {
//     // hi() {
//     //   console.log("Hi from Child class!");
//     // } 
//   }

//   let obj = new Child();

//   class Person {
//     eat() {
//       console.log("Person is eating...");
//     }

//     sleep() {
//       console.log("Person is sleeping...");
//     }
//   }

//   class Engineer {
//     work() {
//       console.log("Engineer is working...");
//     }   
//   }

//   let ABC = new Engineer();

  
  