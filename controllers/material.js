const Material = require('../models/material');
const User = require('../models/user');
const CurrentMaterial = require('../models/currentMaterial');

// const materials = require('../client/src/components/common/materials');


// add existing materials to Material for the first time
exports.test = (req, res) => {
  // req.body.object has the following structure
  // {
  //   material: String,
  //   unit: String,
  //   category: String,
  // }

  // console.log('test', materials.length);

  // materials.forEach(async (object) => {
  //   let newMat = await Material.create(object);

  //   console.log('newMat', newMat);
  // });

  res.json({ success: true });
};


exports.addNewMaterial = async (req, res) => {
  // req.body.object has the following structure
  // {
  //   material: String,
  //   unit: String,
  //   category: String,
  // }
  const newMaterial = { ...req.body.object };

  try {
    // add new material to the list of materials - Material
    const createdMaterial = await Material.create(newMaterial);

    const materialObjectWithAmount = {
      material: req.body.object.material,
      amount: 0,
      unit: req.body.object.unit,
    };


    // ========================
    // add material to current materials list
    const curMat = await CurrentMaterial.findOne();

    let curMatMaterials = [...curMat.materials];

    curMatMaterials.push(materialObjectWithAmount);
    curMat.materials = [...curMatMaterials];
    await curMat.save();


    // ========================
    // add new material to users
    // const users = await User.find();

    // here .then syntax and forEach loop were used because they are faster than "await" syntax and for loop
    User.find()
      .then(users => {
        users.forEach(user => {
          let userMatArray = [...user.materials];
          userMatArray.push(materialObjectWithAmount);

          user.materials = [...userMatArray];
          user.save();
        });
      });

    // for (let i = 0; i < users.length; i++) {
    //   let user = users[i];

    //   userMatArray = [...user.materials];
    //   userMatArray.push(materialObjectWithAmount);

    //   user.materials = [...userMatArray];
    //   await user.save();
    // }

    return res.json(createdMaterial);

  } catch (err) {
    console.log('addNewMaterial ERROR', err);
    return res.status(400).json({ success: true, message: '', error: err });
  }
};


exports.getAllMaterials = async (req, res) => {
  try {
    const allMaterials = await Material.find();

    return res.json(allMaterials);

  } catch (err) {
    console.log('getAllMaterials ERROR', err);
    return res.status(400).json({ success: true, message: '', error: err });
  }
};


exports.deleteMaterialFromDB = async (req, res) => {
  // req.body.object has the following structure
  // {
  //   material: String, -- name of material to delete
  //   unit: String, -- unit of material
  // }

  const nameOfMaterialToDelete = req.body.object.material;
  const unitOfMaterialToDelete = req.body.object.unit;

  try {
    // ===============================
    // delete material from Material
    const materialInMaterialList = await Material.findOne({
      material: nameOfMaterialToDelete,
      unit: unitOfMaterialToDelete
    });

    if (materialInMaterialList) {
      await materialInMaterialList.remove();
    }


    // ===============================
    // delete material from CurrentMaterial
    const curMat = await CurrentMaterial.findOne();

    let curMatMaterials = [...curMat.materials];
    curMatMaterials = curMatMaterials.filter(item => item.material !== nameOfMaterialToDelete);

    curMat.materials = [...curMatMaterials];
    await curMat.save();


    // ===============================
    // delete material from users ('materials' array in User object)
    User.find()
      .then(users => {
        users.forEach(user => {
          let userMatArray = [...user.materials];

          userMatArray = userMatArray.filter(item => item.material !== nameOfMaterialToDelete);

          user.materials = [...userMatArray];
          user.save();
        });
      });

    return res.json({
      success: true,
      message: 'Материал успешно удален',
    });

  } catch (err) {
    console.log('deleteMaterialFromDB ERROR', err);
    return res.status(400).json({ success: true, message: '', error: err });
  }
};