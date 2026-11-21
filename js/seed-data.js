// FoodTrack frontend prototype. Backend integration will be added in the next phase.

// ───── Init sample data ─────
if(!DB.get('ft_init')){
  DB.set('food_items',[
    {id:'1',name:'Basmati Rice',cat:'Grains',qty:50,unit:'kg',pur:D(-10),exp:D(50),cost:60,by:'Admin'},
    {id:'2',name:'Toor Dal',cat:'Pulses',qty:20,unit:'kg',pur:D(-5),exp:D(2),cost:120,by:'Admin'},
    {id:'3',name:'Whole Milk',cat:'Dairy',qty:10,unit:'litres',pur:D(-2),exp:D(1),cost:55,by:'Admin'},
    {id:'4',name:'Bread',cat:'Bakery',qty:5,unit:'loaves',pur:D(-3),exp:D(-1),cost:35,by:'Admin'},
    {id:'5',name:'Tomatoes',cat:'Vegetables',qty:8,unit:'kg',pur:D(-1),exp:D(0),cost:40,by:'Admin'},
    {id:'6',name:'Refined Oil',cat:'Oils',qty:15,unit:'litres',pur:D(-15),exp:D(165),cost:130,by:'Admin'},
    {id:'7',name:'Sugar',cat:'Grains',qty:25,unit:'kg',pur:D(-20),exp:D(70),cost:44,by:'Admin'},
    {id:'8',name:'Paneer',cat:'Dairy',qty:3,unit:'kg',pur:D(-1),exp:D(1),cost:350,by:'Admin'},
    {id:'9',name:'Onions',cat:'Vegetables',qty:12,unit:'kg',pur:D(-5),exp:D(5),cost:30,by:'Admin'},
    {id:'10',name:'Wheat Flour',cat:'Grains',qty:30,unit:'kg',pur:D(-8),exp:D(22),cost:40,by:'Admin'},
  ]);
  DB.set('waste_log',[
    {id:'w1',name:'Old Bread',cat:'Bakery',qty:2,unit:'loaves',reason:'Expired',date:D(-5),cost:70},
    {id:'w2',name:'Spoiled Milk',cat:'Dairy',qty:3,unit:'litres',reason:'Spoilage',date:D(-3),cost:165},
    {id:'w3',name:'Rotten Tomatoes',cat:'Vegetables',qty:2,unit:'kg',reason:'Improper Storage',date:D(-1),cost:80},
    {id:'w4',name:'Stale Dal',cat:'Pulses',qty:1,unit:'kg',reason:'Expired',date:D(-8),cost:120},
  ]);
  DB.set('ft_init',true);
}
