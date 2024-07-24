use std::env;
use std::fs;

fn main() {
    // Define the placeholder
    let placeholder = "FIDENARO_PACKAGE_ADDRESS";

    // Read the replacement value from an environment variable
    let mut replacement = env::var("FIDENARO_PACKAGE_ADDRESS")
        .expect("FIDENARO_PACKAGE_ADDRESS environment variable not set");

    // Add quotes
    replacement = format!("\"{}\"", replacement);

    // Read the source file
    let source_path = "src/lib.rs"; // Adjust the path as necessary
    let content = fs::read_to_string(source_path).expect("Unable to read source file");

    // Replace the placeholder
    let modified_content = content.replace(placeholder, &replacement);

    // Write the modified content back to the file (or to a new file)
    fs::write(source_path, modified_content)
        .expect("Unable to write modified content to source file");

    // Invalidate the build cache to ensure the changes are picked up
    println!("cargo:rerun-if-changed=src/lib.rs");
}
