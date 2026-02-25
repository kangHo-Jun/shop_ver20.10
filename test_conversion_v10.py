import sys
import os
from local_file_processor import process_html_file
import json

def test():
    # Pick a sample file from estimate directory
    estimate_dir = "data/downloads/estimate"
    files = [f for f in os.listdir(estimate_dir) if f.endswith('.html') or f.endswith('.mhtml')]
    
    if not files:
        print("No sample files found for testing.")
        return

    sample_file = os.path.join(estimate_dir, files[0])
    print(f"Testing with file: {sample_file}")

    # Process for estimate
    estimate_data = process_html_file(sample_file, target_type='estimate')
    print("\n--- Estimate Transformation Result ---")
    if estimate_data:
        for i, row in enumerate(estimate_data[:2]): # Show first 2 rows
            print(f"Row {i+1}: {row}")
    else:
        print("Failed to extract data.")

    # Process for ledger
    ledger_data = process_html_file(sample_file, target_type='ledger')
    print("\n--- Ledger Transformation Result ---")
    if ledger_data:
        for i, row in enumerate(ledger_data[:2]): # Show first 2 rows
            print(f"Row {i+1}: {row}")
    else:
        print("Failed to extract data.")

if __name__ == "__main__":
    test()
