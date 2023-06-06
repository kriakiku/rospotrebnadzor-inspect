# inspect.rospotrebnadzor.ru dataset parser

## Environment

To work with the cli, you will need to install deno locally:
https://deno.com/manual@v1.11.3/getting_started/installation

## Dataset

The entire dataset is stored in the folder `dataset`.
These are text files with the extension `.dat` containing a raw html page corresponding to the year and page number.

If necessary, you can use the already collected dataset containing all records from 2012 to 2023 (collected on the evening of 05.06.2023).
To do this, unpack the zip archive `pre-fetched-dataset.tgz` to the 'dataset` folder.


To start collecting the dataset, run the command specifying the `--year` parameter with the years you need (to update the check statuses, clear the `dataset` folder):

```bash
deno run --allow-read --allow-net --allow-write ./src/commands/fetch-dataset.ts --year 2023
```

## Output

All generated `.xlsx` files are saved to the `output' folder.

If necessary, you can use pre-generated tables from the `pre-generated-dataset.tgz` archive (relevant on 05.06.2023).

To generate a table based on the collected dataset, run the command specifying the `--year` parameter with the year you need:

```bash
# Using local installed deno:
deno run --v8-flags=--max-old-space-size=4096 --allow-read --allow-write ./src/commands/write-xlsx.ts --year 2023
```

## Author notes

### Contacts

https://github.com/kriakiku

https://t.me/kriakiku

### Disclaimer

The author has no affiliation with the government structures of the Russian Federation.
This solution is designed to simplify the analysis of open data.
