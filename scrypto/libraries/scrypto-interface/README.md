<div align="center">

  <h1><code>scrypto-interface</code></h1>

  <p>
    <strong>A library facilitating interfacing with Scrypto blueprints and generation of high-level typed abstractions</strong>
  </p>

  <p>
    <a href="https://opensource.org/licenses/Apache-2.0"><img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License" /></a>
    <a href="https://github.com/radixdlt/Ignition/actions/workflows/test.yml"><img src="https://github.com/radixdlt/Ignition/actions/workflows/test.yml/badge.svg" alt="Tests Workflow" /></a>
  </p>
</div>

## Features

There are two main features provided in this crate:

- A `define_interface!` function-like procedural macro that is used to define the interface of blueprints. It then generates a trait describing the interface, Scrypto, Scrypto Test, and Manifest Builder bindings based on the defined interface.
- A `blueprint_with_traits` attribute procedural macro that allows writing blueprints with a single main `impl` block and zero or more `impl`s of traits for the blueprint.

## `define_interface!`

This is a procedural macro used to define the interface of blueprints and generate stubs based on the defined interface.

This macro defines a high-level trait-like DSL for defining the interface of blueprints and defining what this macro should and should not generate. This macro currently can generate the following four stubs based on the provided blueprint interface:

- Trait: A trait of the blueprint interface including all of the methods and functions.
- Scrypto Stubs: Stubs that provide higher-level type-checked stubs for interactions with the blueprint from Scrypto.
- Scrypto Test Stubs: Stubs that provide higher-level type-checked stubs for interactions with the blueprint from the Scrypto Test framework.
- Manifest Builder Stubs: Extends the manifest builder with methods for interacting with the blueprint and components of the blueprint through the manifest builder.

This macro can be configured to generate either all of the above stubs or just a subset of them, this can be useful in situations and cases where the crates required for the full stubs are not available in a particular setting and thus should not be generated.

### Example

```rust
define_interface! {
    // The name of the blueprint
    Radiswap {
        // All of the methods and functions that the blueprint has.
        fn swap(
            &mut self,
            bucket1: Bucket,
        ) -> (Bucket, Option<Bucket>);
    }
}
```

### Usage

This section provides a guide on how to use this macro and the different settings and arguments that can be passed.

#### Changing the Struct Name

The name of the generated `struct` can be changed by adding an `as $Ident` after the blueprint name. This is useful in cases where the blueprint is named one thing but we would like for the generated stubs to use a different name completely.

```rust
define_interface! {
    // The name of the blueprint
    Radiswap as Dex {
        // All of the methods and functions that the blueprint has.
        fn swap(
            &mut self,
            bucket1: Bucket,
        ) -> (Bucket, Option<Bucket>);
    }
}
```

#### Controlling What Is Generated

As mentioned previously, this macro allows the user to specify what they wish to have generated and defaults to generating all that it can if nothing is specified explicitly.

The user can control what they wish to have generated by passing an
`impl [$($expr),*]` after the struct name. The possible values that can be
there are:

- `Trait`
- `ScryptoStub`
- `ScryptoTestStub`
- `ManifestBuilderStub`

As an example, if we wish to only generate the scrypto test and the manifest builder stubs for a particular blueprint then we would invoke this macro as follows:

```rust
define_interface! {
    // The name of the blueprint - in this example, providing a struct
    // name (the `as Dex` is the struct name) is optional, just shown to
    // make it clear where the `impl` goes; after the blueprint and struct
    // names.
    Radiswap as Dex impl [ScryptoTestStub, ManifestBuilderStub] {
        // All of the methods and functions that the blueprint has.
        fn swap(
            &mut self,
            bucket1: Bucket,
        ) -> (Bucket, Option<Bucket>);
    }
}
```

#### Specifying the Manifest Types

In some interfaces, the types to use in Scrypto and the manifest will be different, this distinction is especially important when this macro will generate the manifest builder stubs. As an example, `Bucket` is not a valid type in the context of the manifest builder, `ManifestBucket` is.

This macro allows you to specify the type that should be used for the manifest builder by adding a `#[manifest_type = "$ty"]` on top of the argument you wish to have their type changed.

For the Radiswap example above, we can control the types to use for the manifest builder as follows:

```rust
define_interface! {
    // The name of the blueprint - in this example, providing a struct
    // name (the `as Dex` is the struct name) is optional, just shown to
    // make it clear where the `impl` goes; after the blueprint and struct
    // names.
    Radiswap as Dex impl [ScryptoTestStub, ManifestBuilderStub] {
        // All of the methods and functions that the blueprint has.
        fn swap(
            &mut self,
            #[manifest_type = "ManifestBucket"]
            bucket1: Bucket,
        ) -> (Bucket, Option<Bucket>);
    }
}
```

### Generated

#### Trait

The generated trait will have the name `$struct_name InterfaceTrait` and will have the methods and functions of the blueprint in the exact way that they were specified in the macro invocation with no difference at all. This trait will not use any of the defined `manifest_type`s as those are meant for `ManifestBuilderStub`s generated by this macro.

This generated trait can be useful in a number of settings. An example of that would be the development of a number of adapter blueprints that must adhere to particular interface. This adherence to said interface can be checked at compile-time by defining the interface through this macro and then implementing the generated trait on the blueprint with the aid of the `blueprint_with_traits` macro. As an example:

```rust
use scrypto::prelude::*;
use scrypto_interface::*;

define_interface! {
    DexPairAdapter impl [Trait] {
         fn swap(
            &mut self,
            bucket1: Bucket,
        ) -> (Bucket, Option<Bucket>);
    }
}

#[blueprint_with_traits]
mod adapter1 {
    struct Adapter1;

    impl Adapter1 {
        /* Some functions and methods */
    }

    // This trait has been generated by the `define_interface` trait above.
    // The postfix added to the name is described in this sub-section.
    impl DexPairAdapterInterfaceTrait for Adapter1 {
        fn swap(
            &mut self,
            bucket1: Bucket,
        ) -> (Bucket, Option<Bucket>) {
            todo!("Write an implementation here")
        }
    }
}

#[blueprint_with_traits]
mod adapter1 {
    struct Adapter2;

    impl Adapter2 {
        /* Some functions and methods */
    }

    // This trait has been generated by the `define_interface` trait above.
    // The postfix added to the name is described in this sub-section.
    impl DexPairAdapterInterfaceTrait for Adapter2 {
        fn swap(
            &mut self,
            bucket1: Bucket,
        ) -> (Bucket, Option<Bucket>) {
            todo!("Write an implementation here")
        }
    }
}
```

The adherence of the adapters to the `DexPairAdapterInterfaceTrait` trait is checked at compile-time so there is no chance of implementing the interface in an incorrect way or in a way that is not expected by the clients that will be calling into the adapters.

#### Scrypto Stubs

Scrypto stubs are generated from the provided interface to facilitate and provide a typed-abstraction for invoking blueprints and components that implement this interface. The generated struct has the name `$struct_name` with a postfix of `InterfaceScryptoStub`.

The generated `struct` has all of the interface functions and methods implemented on it. The methods are implemented as is, with no changes to the arguments and the returns. Functions have an additional argument at the end named `blueprint_package_address` which is the `PackageAddress` of the package that the blueprint belongs to.

The generated `struct` is transparent in SBOR, meaning that it can be used as an argument or a return type and will be treated as a `ComponentAddress` in encoding and decoding. Thus, no manual casting needs to be done manually by the user inside of the body of functions.

This is especially used in areas where the `external_blueprint` and `external_component` are not suitable, specifically in cases when the package address or component address of said external entity is not known at compile-time but the only thing that is known is the interface of it. This could perhaps be due to the difference of addresses between networks or due to the component or package being instantiated or published later on.

The following is an example of this in action:

```rust
use scrypto::prelude::*;
use scrypto_interface::*;

define_interface! {
    DexPairAdapter impl [ScryptoStub] {
         fn swap(
            &mut self,
            bucket1: Bucket,
        ) -> (Bucket, Option<Bucket>);
    }
}


#[blueprint_with_traits]
mod client {
    struct Client;

    impl Client {
        fn call_dex(
            &mut self,
            // A `DexPairAdapterInterfaceScryptoStub` can be decoded from a
            // `ComponentAddress` passed in the manifest.
            dex_adapter: DexPairAdapterInterfaceScryptoStub,
            bucket: Bucket
        ) {
            // The methods are available and can be called. Everything is
            // typed and type checked.
            let (bucket, change) = dex_adapter.swap(bucket);

            todo!("Continue the implementation!");
        }
    }
}
```

#### Scrypto Test Stubs

In a similar fashion to Scrypto stubs, this macro generated stubs to be used for the Scrypto Test framework. These stubs are meant to provide a typed abstraction over the blueprint removing the need to perform manual encoding and decoding and adding compile-time enforced type checks on interactions with the blueprint or components of the blueprint. The generated struct has the name `$struct_name` with a postfix of `InterfaceScryptoTestStub`.

The generated methods and functions have the same name as defined in the macro invocation. All functions have an additional argument named `blueprint_package_address` which is the `PackageAddress` of the package that the blueprint belongs to, and all functions and methods end with an argument called `env` which is a generic argument of any type that has a `::radix_engine_interface::prelude::ClientApi<E>` implementation. This is practically going to be the scrypto test environment. The return types are changed as well such that the functions return a `Result<T, RuntimeError>` instead of `T` where `T` is their original return type.

The stubs generated by this macro can be useful in cases when tests involve blueprints external to the current project with no source code provided and just a WASM and an RPD. Thus, no scrypto-test stubs are provided with them from the `blueprint` macro.

The following is an example of this macro in action:

```rust
use scrypto::prelude::*;
use scrypto_test::prelude::*;
use scrypto_interface::*;

define_interface! {
    Radiswap impl [ScryptoTestStub] {
         fn swap(
            &mut self,
            bucket1: Bucket,
        ) -> (Bucket, Option<Bucket>);
    }
}


#[test]
fn some_test() {
    // Arrange
    let env = &mut TestEnvironment::new();
    let mut pool: RadiswapInterfaceScryptoTestStub = todo!();

    // Act
    let bucket: Bucket = todo!();
    let rtn = pool.swap(bucket, env);

    // Assert
    assert!(rtn.is_ok())
}
```

#### Manifest Builder Stubs

Each invocation of this macro extends the manifest builder adding methods to it that are specific to the blueprint at hand. Similar to the other stubs this also provides typed-abstractions for invocations of the blueprint in manifest builder making it much easier to invoke the blueprint or components of the blueprint from the manifest through the manifest builder. This generates an extension trait of the name `$struct_name` and a postfix of `InterfaceManifestBuilderExtensionTrait`. Since this is an extension trait, this means that the methods that it provides should be available directly on the `ManifestBuilder` type as soon as the trait is imported since this macro also generates an implementation of this extension trait.

Out of all of the generations performed by this macro, this one perhaps does the most amount of changes to the functions and methods passed in the macro invocation. Specifically:

- The methods on the `ManifestBuilder` are provided as the snake case name of the struct followed by the name of the method. As an example, for the `Radiswap` interface used so far in this doc, the generated method would be called `radiswap_swap` (`$struct_name _ $method_name`).
- A `PackageAddress` argument is added to the beginning for all functions and ` ComponentAddress` argument is added to the beginning of all methods.
- The types are replaced by the types specified in the `manifest_type`, if any types were specified there.

The following is an example of this in action:

```rust
use scrypto::prelude::*;
use scrypto_interface::*;
use transaction::builder::*;

define_interface! {
    Radiswap impl [ManifestBuilderStub] {
         fn swap(
            &mut self,
            #[manifest_type = "ManifestBucket"]
            bucket1: Bucket,
        ) -> (Bucket, Option<Bucket>);
    }
}

#[test]
fn some_test() {
    let account: ComponentAddress = todo!();
    let radiswap: ComponentAddress = todo!();
    let manifest = ManifestBuilder::new()
        .withdraw_from_account(account, XRD, dec!(100))
        .take_all_from_worktop(XRD, "bucket")
        .with_bucket("bucket", |builder, bucket| {
            // This method is now available on the manifest builder and can
            // be invoked directly.
            builder.radiswap_swap(radiswap, bucket)
        })
        .try_deposit_entire_worktop_or_abort(account, None);
}
```

## `#[blueprint_with_traits]`

A procedural blueprint macro with the added support for traits allowing for compile-time checking of interfaces.

This macro performs some logic and then delegates the remaining logic to scrypto's blueprint macro, thus the logic of this macro should not diverge from the main blueprint macro.

This macro starts by finding all of the trait implementations inside the module and removing them from there. It then copies the implementation of the trait to the `impl` block of the blueprint. Then, a `const _: ()` block is used to house a trait implementation for a private type.

This means that:

- A blueprint can contain trait implementations. These implementations do not have a fixed place and can occur in any order and will be handled as expected by this macro.
- Functions and methods implemented through traits will be made public and can not be changed.
- Functions and methods implemented through traits will be implemented in the main impl block of the blueprint and will be considered as a normal public function or method.

This macro can be used just like the regular `blueprint` macro from Scrypto. In fact, this macro just performs some post-processing and delegates the rest to the regular `blueprint` macro.

### Example

```rust
use scrypto::prelude::*;
use scrypto_interface::*;

#[blueprint_with_traits]
mod blueprint {
    pub struct MyBlueprint;

    impl MyBlueprint {
        pub fn instantiate() -> Global<MyBlueprint> {
            todo!()
        }
    }

    // This is now permitted, these methods and functions will be
    // implemented on the blueprint itself.
    impl MyTrait for MyBlueprint {
        pub fn my_method(&mut self) -> u32 {
            todo!()
        }
    }
}

pub trait MyTrait {
    fn my_method(&mut self) -> u32;
}
```