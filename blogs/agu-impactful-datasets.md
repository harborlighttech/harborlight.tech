# The spreadsheet was not the problem

The American Geophysical Union asked its community which datasets changed their field. A hundred and thirty-three nominations came back, written by 174 scientists. Sixteen columns, one row each.

> Everything needed was in that file. None of it could be seen.

## A column is not a relationship

Look at one row.

| Column | Holds |
| --- | --- |
| A | a discipline |
| B | a dataset name |
| I | several paragraphs explaining why the dataset matters |
| M | the name of the person who wrote those paragraphs |

A human reading across understands immediately that this person endorsed this dataset, for these reasons, in this field. The spreadsheet understands none of it. The connection between column I and column M exists only because the two cells happen to sit on the same line. Move a row, split a cell, export to a new format, and the meaning is gone, because it was never recorded. It was inferred by whoever was reading.

That is the actual limitation. Not the file format, and not the size of the file. A spreadsheet stores values. The relationships between those values live in the reader's head, which means they cannot be searched, counted, followed or drawn.

## Writing the relationships down

The work was to state plainly what the columns only implied.

- A **person** endorsed a **dataset**.
- The endorsement carries a **reason**.
- The dataset sits in a **discipline**, lives in a **repository**, and is cited by **publications**.
- The person has an **identity** that exists outside this file.

Each of those is a sentence with a subject, a verb and an object. Once written down that way, they stop being cell contents and become facts that can be traversed. Three of them chain together to answer a question no column could: which researchers endorsed datasets in more than one field.

The vocabulary is schema.org, which matters for a practical reason. The relationships are described in terms the rest of the web already uses, so the result is not a private arrangement that only our code understands.

## Relationships can be drawn

This is the part that surprises people. Making relationships explicit is usually sold as a technical improvement. Its most visible effect is that the data becomes drawable.

> A spreadsheet has one shape, and it is the shape of a spreadsheet. A set of connected facts has whatever shape the facts have, and you can put that on a screen.

So the collection opens as a shelf. Every dataset is a book, grouped and coloured by discipline, because "dataset belongs to discipline" is now something the page can act on. The shape of the community's attention is visible before you click anything. Ocean science drew 31 nominations. Earth and planetary materials drew two.

Because "person endorsed dataset" is explicit, the page can show that nine separate researchers independently put forward the same TCCON data release. In a row-per-nomination file those nine sit hundreds of rows apart and nobody ever notices they agree.

Because "endorsement has a reason, written by a person" is explicit, each dataset page shows the nominators by name with their full argument, instead of the prose staying folded into column I where nobody reads it.

And because the relationships are countable, the collection answers questions nobody asked it. Only 37 of the 133 most-valued datasets have a DOI. The community has said what it considers important, and three quarters of it cannot be cleanly cited. That finding came from the structure, not from a study.

## It stays current

Nominations keep arriving through the same form, into the same spreadsheet. Nothing about how people work has to change.

New nominations are folded in by re-running the process. Datasets already published keep their addresses, so links shared in talks and emails still resolve. There is no database to maintain and no platform to log into. The collection is a single file at a fixed address on AGU's own domain, published in a vocabulary that harvesters and publishers already read, which anyone can fetch and build on without asking us.

## Harbor Light Technologies

We make the relationships in an organisation's data explicit, so the data can be searched, published and seen.

Most organisations have a spreadsheet where the important part is the part no column captures.

**Adam Shepherd**, Founder\
[harborlight.tech](https://harborlight.tech) · [adam@harborlight.tech](mailto:adam@harborlight.tech)
