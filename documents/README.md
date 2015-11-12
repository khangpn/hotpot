# Agenda
This project is planned to be ended in February 1st 2016. So there are about 3 months left.
Coding will be divided into 4 iterations, each of which is 15 days long and consists of a set of features to be implemented which will be listed belowed.
Documentation will be noted along the coding process. Final thesis paper will be composed in the last iteration.

![Hotpot project Gant Chart](https://github.com/khangpn/hotpot/tree/master/documents/hotpot_gantchart.png)

-------------------------------------------------------------
# Documents

- All the tex paper is stored here. The pdf version of my thesis can be found [here](https://www.dropbox.com/s/fc09h2s5blzjgbn/main.pdf?dl=0 PDF File).
- [Diary](https://github.com/khangpn/hotpot/tree/master/documents/diary) directory contains my reports for every working days. It includes my work, problems I encouter, solution and learning from that day's work.

-------------------------------------------------------------
# Features List
This is the list of features which are going to be implemented in the project or openning for future. This could be updated later.

1. create user
  - assign category, security level
  - only admin can create account
2. create document
  - creator can only create documents with his categories labeled, with the same or higher security level.
  - creator can make a document public or private.
3. list documents
  - only show documents whose categories is a subset of the viewer's categories, and its security level is lower or equals to the views'.
4. create ticket
  - ticket is a subtype of document with special attributes.
5. check documents' content (optional)
  - check document's content on saving against a list of keywords to automatically raise up its security level.
6. notification (optional)
  - send noticiation to all related users when new document added.
7. quick task dispenser (optional)
  - single btn to give user his next task based on the priority and due date of the ticket.

## 1st Iteration (27/10/2015 to 16/11/2015)
- Setup env.
- Create initial DB schema.
- Create user.
- Assign user with categories and security level.

Outcome: 
- A skeleton of the tool with user creation function.
- Update document to show this feature with illustration e.g SQL diagram...

## 2nd Iteration (17/11/2015 to 7/12/2015)
- Create document.
- List document concerning to user's labels.
- Assign document with categories and security level.

Outcome: 
- Able to create new documents with suitable categories and security labels.
- Viewers can only list what they need to know
- Update document to show this feature with illustration e.g SQL diagram...

## 3rd Iteration (8/12/2015 to 21/12/2015)
- Create ticket.
- Put some graphical design here.

Outcome: 
- Able to create new tickets with suitable categories and security labels.
- The tool looks friendly enough for users to keep using it.
- Update document to show this feature with illustration e.g SQL diagram...

## 4th Iteration (4/12/2015 to 22/1/2016)
- Testing and fix flaws.
- Optimise the design.
- Open Beta released.
- Start composing and editing final paper. (end on 29/1/2016)

Outcome:
- A usable version of the tool with handy design.
- Fully composed thesis paper to send to my supervisor for feedbacks.
