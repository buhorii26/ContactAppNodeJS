const express = require("express");
const app = express();
const port = 8080;
const expressLayouts = require("express-ejs-layouts");

require("./utility/database");
const Contact = require("./models/contact");

//express validator
const { body, validationResult, check } = require("express-validator");

//method-override
const methodOverride = require("method-override");

//session flash
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

// override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

//menggunakan EJS Template Engine
app.set("view engine", "ejs");

//set up express js layout or third-party Middleware
app.use(expressLayouts);

//build in middleware express static mengakses foldes static
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// konfigurasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

//halaman home mahasiswa
app.get("/", (req, res) => {
  res.render("home", {
    layout: "layouts/main",
    title: "Home",
  });
});

//code untuk menampilkan halaman routes about
app.get("/about", (req, res) => {
  res.render("about", { layout: "layouts/main", title: "About" });
});

//code untuk menampilkan halaman routes contact
app.get("/contact", async (req, res) => {
  // Contact.find().then((contact) => {
  //   res.send(contact);
  // });
  const contacts = await Contact.find();
  res.render("contact", {
    layout: "layouts/main",
    title: "Contact",
    contacts,
    msg: req.flash("msg"),
  });
});

//halaman form tambah data contact
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Form tambah data kontak",
    layout: "layouts/main",
  });
});

//proses tambah data contact
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("nama sudah ada!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "Nomor HP tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Form Data Kontak",
        layout: "layouts/main",
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (error, result) => {
        //kirim flash message
        req.flash("msg", "Data kontak  berhasil di input!");
        res.redirect("/contact");
      });
    }
  }
);

app.delete("/contact", (req, res) => {
  Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    //kirim flash message
    req.flash("msg", "Data kontak  berhasil di dihapus!");
    res.redirect("/contact");
  });
});

//halaman form edit contact
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  res.render("edit-contact", {
    title: "Form ubah data kontak",
    layout: "layouts/main",
    contact,
  });
});

//proses ubah data
app.put(
  "/contact/",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (value !== req.body.namaLama && duplikat) {
        throw new Error("nama sudah ada!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "Nomor HP tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Form Ubah Data Kontak",
        layout: "layouts/main",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            nohp: req.body.nohp,
            email: req.body.email,
          },
        }
      ).then((result) => {
        // //kirim flash message
        req.flash("msg", "Data kontak  berhasil di ubah!");
        res.redirect("/contact");
      });
    }
  }
);

// detail contact
app.get("/contact/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render("detail-contact", {
    layout: "layouts/main",
    title: "Detail Contact",
    contact,
  });
});

app.listen(port, () => {
  console.log(`server is running on port http://localhost:${port}/`);
});
