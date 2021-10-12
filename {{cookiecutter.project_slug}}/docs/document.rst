
Document
=========

This project uses Sphinx_ documentation generator.

Generate API documentation
----------------------------

Edit the ``docs`` files in case you added any thing to your project the run the following command from the project directory to build and serve HTML documentation. ::
    
    $ cd {{cookiecutter.project_name}}
    $ make -C docs html # creates the docs

    then serve them::
    $ python3 -m http.server 4000

Sphinx can automatically include class and function signatures and docstrings in generated documentation.
See the generated project documentation for more examples.


.. _Sphinx: https://www.sphinx-doc.org/en/master/index.html