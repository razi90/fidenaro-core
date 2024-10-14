use std::env;
use std::fs;

fn main() {
    // Define the placeholder
    let placeholder_fidenaro =
        "package_sim1pkyls09c258rasrvaee89dnapp2male6v6lmh7en5ynmtnavqdsvk9";

    // Read the replacement value from an environment variable
    let replacement_fidenaro = env::var("FIDENARO_PACKAGE_ADDRESS")
        .unwrap_or_else(|_| placeholder_fidenaro.to_string());

    // Read the source file
    let source_path = "src/lib.rs"; // Adjust the path as necessary
    let content =
        fs::read_to_string(source_path).expect("Unable to read source file");

    // Replace the placeholder
    let modified_content =
        content.replace(placeholder_fidenaro, &replacement_fidenaro);

    // Write the modified content back to the file (or to a new file)
    fs::write(source_path, modified_content)
        .expect("Unable to write modified content to source file");

    // Invalidate the build cache to ensure the changes are picked up
    println!("cargo:rerun-if-changed=src/lib.rs");
}
