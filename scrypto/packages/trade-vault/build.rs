use std::env;
use std::fs;

fn main() {
    // Define the placeholder
    let placeholder =
        "package_sim1pkuj90ee40aujtm7p7jpzlr30jymfu5mgzkaf36t626my7ftuhjmnx";

    // Read the replacement value from an environment variable
    let replacement = env::var("FIDENARO_PACKAGE_ADDRESS")
        .unwrap_or_else(|_| placeholder.to_string());

    // Read the source file
    let source_path = "src/lib.rs"; // Adjust the path as necessary
    let content =
        fs::read_to_string(source_path).expect("Unable to read source file");

    // Replace the placeholder
    let modified_content = content.replace(placeholder, &replacement);

    // Write the modified content back to the file (or to a new file)
    fs::write(source_path, modified_content)
        .expect("Unable to write modified content to source file");

    // Invalidate the build cache to ensure the changes are picked up
    println!("cargo:rerun-if-changed=src/lib.rs");
}
